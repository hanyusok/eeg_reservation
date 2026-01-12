import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const createPatientSchema = z.object({
  userId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  dateOfBirth: z.string().date(),
  medicalRecordNumber: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  emergencyContactName: z.string().min(1),
  emergencyContactPhone: z.string().min(1),
})

// GET /api/patients - List patients
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let where: any = {}

    // Filter by role
    if (session.user.role === "parent") {
      where.parentId = session.user.id
    } else if (session.user.role === "patient") {
      where.userId = session.user.id
    } else if (session.user.role === "admin" || session.user.role === "doctor") {
      // Admin and doctor can see all patients
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const patients = await prisma.patient.findMany({
      where,
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
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ patients })
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/patients - Create patient
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPatientSchema.parse(body)

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "parent") {
      // Parent can create patient profile for their child
      if (validatedData.parentId && validatedData.parentId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      // If no parentId specified, use current user as parent
      validatedData.parentId = session.user.id
    } else if (session.user.role === "patient") {
      // Patient can create their own patient profile
      // The userId must be their own, and parentId should be null or their own userId
      if (validatedData.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Patients can only create profiles for themselves" },
          { status: 403 }
        )
      }
      // Patient creating their own profile - no parent
      validatedData.parentId = undefined
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if patient already exists for this user
    const existingPatient = await prisma.patient.findUnique({
      where: { userId: validatedData.userId },
    })

    if (existingPatient) {
      return NextResponse.json(
        { error: "Patient profile already exists for this user" },
        { status: 400 }
      )
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        userId: validatedData.userId,
        parentId: validatedData.parentId,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        medicalRecordNumber: validatedData.medicalRecordNumber,
        medicalHistory: validatedData.medicalHistory,
        currentMedications: validatedData.currentMedications,
        emergencyContactName: validatedData.emergencyContactName,
        emergencyContactPhone: validatedData.emergencyContactPhone,
      },
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
        action: "patient_created",
        entityType: "patient",
        entityId: patient.id,
        details: {
          userId: patient.userId,
          parentId: patient.parentId,
        },
      },
    })

    return NextResponse.json({ patient }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors)
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating patient:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

