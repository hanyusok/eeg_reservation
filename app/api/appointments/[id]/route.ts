import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendAppointmentCancellation, sendAppointmentRescheduled } from "@/lib/email"
import { triggerAppointmentCancellationWorkflow } from "@/lib/zapier"
import * as z from "zod"

const updateAppointmentSchema = z.object({
  appointmentType: z.enum(["initial_consultation", "eeg_monitoring", "follow_up"]).optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional(),
  status: z.enum(["scheduled", "completed", "cancelled", "rescheduled"]).optional(),
  notes: z.string().optional(),
})

// GET /api/appointments/:id - Get appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
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
        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "parent") {
      if (appointment.parentId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role === "patient") {
      if (appointment.patient.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/appointments/:id - Update appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "parent") {
      if (appointment.parentId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role === "patient") {
      const patient = await prisma.patient.findUnique({
        where: { id: appointment.patientId },
      })
      if (patient?.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateAppointmentSchema.parse(body)

    const updateData: any = {}
    if (validatedData.appointmentType) updateData.appointmentType = validatedData.appointmentType
    if (validatedData.scheduledAt) updateData.scheduledAt = new Date(validatedData.scheduledAt)
    if (validatedData.durationMinutes) updateData.durationMinutes = validatedData.durationMinutes
    if (validatedData.status) updateData.status = validatedData.status
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes

    const wasRescheduled = validatedData.scheduledAt && appointment.scheduledAt.getTime() !== new Date(validatedData.scheduledAt).getTime()
    const wasCompleted = validatedData.status === "completed" && appointment.status !== "completed"

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
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
        action: "appointment_updated",
        entityType: "appointment",
        entityId: updatedAppointment.id,
        details: validatedData,
      },
    })

    // Send rescheduled email if appointment was rescheduled
    if (wasRescheduled && validatedData.scheduledAt) {
      try {
        const patientName = `${updatedAppointment.patient.user.firstName} ${updatedAppointment.patient.user.lastName}`
        await sendAppointmentRescheduled(
          updatedAppointment.parent.email,
          {
            appointmentType: updatedAppointment.appointmentType,
            scheduledAt: appointment.scheduledAt,
            rescheduleDate: new Date(validatedData.scheduledAt),
            durationMinutes: updatedAppointment.durationMinutes,
            patientName,
          }
        )
      } catch (error) {
        console.error("Failed to send rescheduled email:", error)
      }
    }

    // Trigger follow-up workflow if appointment was completed
    if (wasCompleted) {
      try {
        const { triggerFollowUpWorkflow } = await import("@/lib/zapier")
        const patientName = `${updatedAppointment.patient.user.firstName} ${updatedAppointment.patient.user.lastName}`
        await triggerFollowUpWorkflow({
          id: updatedAppointment.id,
          patientName,
          parentEmail: updatedAppointment.parent.email,
          appointmentType: updatedAppointment.appointmentType,
          completedAt: updatedAppointment.scheduledAt,
        })
      } catch (error) {
        console.error("Failed to trigger follow-up workflow:", error)
      }
    }

    return NextResponse.json({ appointment: updatedAppointment })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating appointment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/:id - Cancel appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "parent") {
      if (appointment.parentId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role === "patient") {
      const patient = await prisma.patient.findUnique({
        where: { id: appointment.patientId },
      })
      if (patient?.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update status to cancelled instead of deleting
    const cancelledAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: "cancelled",
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
        action: "appointment_cancelled",
        entityType: "appointment",
        entityId: cancelledAppointment.id,
      },
    })

    // Send cancellation email and trigger Zapier workflow (async)
    try {
      const patientName = `${cancelledAppointment.patient.user.firstName} ${cancelledAppointment.patient.user.lastName}`
      
      await sendAppointmentCancellation(
        cancelledAppointment.parent.email,
        {
          appointmentType: cancelledAppointment.appointmentType,
          scheduledAt: cancelledAppointment.scheduledAt,
          patientName,
        }
      )

      await triggerAppointmentCancellationWorkflow({
        id: cancelledAppointment.id,
        patientName,
        parentEmail: cancelledAppointment.parent.email,
        appointmentType: cancelledAppointment.appointmentType,
        scheduledAt: cancelledAppointment.scheduledAt,
      })
    } catch (error) {
      console.error("Failed to send cancellation email or trigger Zapier:", error)
    }

    return NextResponse.json({ appointment: cancelledAppointment })
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

