import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/patients/:id/appointments - Get patient appointments
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
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
    } else if (session.user.role === "patient") {
      if (patient.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: params.id,
      },
      include: {
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
    console.error("Error fetching patient appointments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

