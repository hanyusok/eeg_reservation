import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const updatePatientSchema = z.object({
  dateOfBirth: z.string().date().optional(),
  medicalRecordNumber: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  emergencyContactName: z.string().min(1).optional(),
  emergencyContactPhone: z.string().min(1).optional(),
  parentId: z.string().uuid().optional(),
})

// GET /api/patients/:id - Get patient details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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
        appointments: {
          orderBy: {
            scheduledAt: "desc",
          },
          take: 10,
        },
        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
          take: 10,
        },
      },
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

    return NextResponse.json({ patient })
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/patients/:id - Update patient
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "parent") {
      if (patient.parentId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updatePatientSchema.parse(body)

    const updateData: any = {}
    if (validatedData.dateOfBirth) updateData.dateOfBirth = new Date(validatedData.dateOfBirth)
    if (validatedData.medicalRecordNumber !== undefined) updateData.medicalRecordNumber = validatedData.medicalRecordNumber
    if (validatedData.medicalHistory !== undefined) updateData.medicalHistory = validatedData.medicalHistory
    if (validatedData.currentMedications !== undefined) updateData.currentMedications = validatedData.currentMedications
    if (validatedData.emergencyContactName) updateData.emergencyContactName = validatedData.emergencyContactName
    if (validatedData.emergencyContactPhone) updateData.emergencyContactPhone = validatedData.emergencyContactPhone
    if (validatedData.parentId) updateData.parentId = validatedData.parentId

    const updatedPatient = await prisma.patient.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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
        action: "patient_updated",
        entityType: "patient",
        entityId: updatedPatient.id,
        details: validatedData,
      },
    })

    return NextResponse.json({ patient: updatedPatient })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating patient:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

