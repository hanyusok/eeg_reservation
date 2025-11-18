import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendAppointmentConfirmation } from "@/lib/email"
import { triggerNewAppointmentWorkflow } from "@/lib/zapier"
import * as z from "zod"

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  calendlyEventId: z.string().optional(),
  appointmentType: z.enum(["initial_consultation", "eeg_monitoring", "follow_up"]),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().positive().default(60),
  notes: z.string().optional(),
})

// GET /api/appointments - List appointments
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const status = searchParams.get("status")

    let where: any = {}

    // Filter by role
    if (session.user.role === "parent") {
      where.parentId = session.user.id
    } else if (session.user.role === "patient") {
      where.patient = {
        userId: session.user.id,
      }
    } else if (session.user.role === "admin" || session.user.role === "doctor") {
      // Admin and doctor can see all appointments
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (patientId) {
      where.patientId = patientId
    }

    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Create appointment
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAppointmentSchema.parse(body)

    // Verify patient exists and user has access
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId },
      include: { user: true },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "parent") {
      if (patient.parentId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role === "patient") {
      if (patient.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: validatedData.patientId,
        parentId: patient.parentId || patient.userId,
        calendlyEventId: validatedData.calendlyEventId,
        appointmentType: validatedData.appointmentType,
        scheduledAt: new Date(validatedData.scheduledAt),
        durationMinutes: validatedData.durationMinutes,
        notes: validatedData.notes,
        status: "scheduled",
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "appointment_created",
        entityType: "appointment",
        entityId: appointment.id,
        details: {
          appointmentType: appointment.appointmentType,
          scheduledAt: appointment.scheduledAt,
        },
      },
    })

    // Send confirmation email and trigger Zapier workflow (async, don't wait for it)
    try {
      const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
      
      // Send email
      await sendAppointmentConfirmation(
        appointment.parent.email,
        {
          appointmentType: appointment.appointmentType,
          scheduledAt: appointment.scheduledAt,
          durationMinutes: appointment.durationMinutes,
          patientName,
          appointmentId: appointment.id,
        }
      )

      // Trigger Zapier workflow
      await triggerNewAppointmentWorkflow({
        id: appointment.id,
        patientName,
        parentEmail: appointment.parent.email,
        appointmentType: appointment.appointmentType,
        scheduledAt: appointment.scheduledAt,
        durationMinutes: appointment.durationMinutes,
      })
    } catch (error) {
      console.error("Failed to send confirmation email or trigger Zapier:", error)
      // Don't fail the request if email/Zapier fails
    }

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating appointment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

