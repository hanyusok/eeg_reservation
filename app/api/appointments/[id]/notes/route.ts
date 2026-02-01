import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const createNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
})

// GET /api/appointments/:id/notes - Get appointment notes
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

    // For now, we'll store notes in the appointment.notes field
    // In a more advanced system, you'd have a separate notes table
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      select: {
        notes: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Return notes as an array (for now, just the single notes field)
    // In production, you'd query a separate notes table
    const notes = appointment.notes
      ? [
        {
          id: params.id + "-note",
          content: appointment.notes,
          createdAt: new Date().toISOString(),
          user: {
            firstName: session.user.name?.split(" ")[0] || "Admin",
            lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
          },
        },
      ]
      : []

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error fetching appointment notes:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/appointments/:id/notes - Add appointment note
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = createNoteSchema.parse(body)

    // Append note to existing notes
    const timestamp = new Date().toLocaleString()
    const userInfo = session.user.name || session.user.email
    const newNote = `[${timestamp}] ${userInfo}: ${validatedData.content}`
    const updatedNotes = appointment.notes
      ? `${appointment.notes}\n\n${newNote}`
      : newNote

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        notes: updatedNotes,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "appointment_note_added",
        entityType: "appointment",
        entityId: appointment.id,
        details: {
          noteLength: validatedData.content.length,
        },
      },
    })

    return NextResponse.json({
      note: {
        id: params.id + "-note",
        content: validatedData.content,
        createdAt: new Date().toISOString(),
        user: {
          firstName: session.user.name?.split(" ")[0] || "Admin",
          lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error adding appointment note:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

