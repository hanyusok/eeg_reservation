import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const linkParentSchema = z.object({
  patientId: z.string().uuid(),
  parentEmail: z.string().email(),
})

// POST /api/patients/link-parent - Link a parent to a patient
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = linkParentSchema.parse(body)

    // Find parent user by email
    const parentUser = await prisma.user.findUnique({
      where: { email: validatedData.parentEmail },
    })

    if (!parentUser) {
      return NextResponse.json(
        { error: "Parent user not found with this email" },
        { status: 404 }
      )
    }

    if (parentUser.role !== "parent") {
      return NextResponse.json(
        { error: "User is not a parent account" },
        { status: 400 }
      )
    }

    // Find patient
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Check permissions - only admin, doctor, or current parent can link
    if (session.user.role === "parent") {
      if (patient.parentId !== session.user.id && parentUser.id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update patient with new parent
    const updatedPatient = await prisma.patient.update({
      where: { id: validatedData.patientId },
      data: {
        parentId: parentUser.id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
        action: "patient_parent_linked",
        entityType: "patient",
        entityId: updatedPatient.id,
        details: {
          parentId: parentUser.id,
          parentEmail: validatedData.parentEmail,
        },
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

    console.error("Error linking parent:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

