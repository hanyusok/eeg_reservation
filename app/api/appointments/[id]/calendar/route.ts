import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateGoogleCalendarLink, generateICalFile } from "@/lib/calendar"

/**
 * GET /api/appointments/:id/calendar
 * Get calendar links for an appointment
 */
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
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        parent: {
          select: {
            email: true,
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

    const appointmentTypeFormatted = appointment.appointmentType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
    const endTime = new Date(appointment.scheduledAt)
    endTime.setMinutes(endTime.getMinutes() + appointment.durationMinutes)

    const calendarEvent = {
      summary: `${appointmentTypeFormatted} - ${patientName}`,
      description: `EEG Monitoring Appointment\nPatient: ${patientName}\nType: ${appointmentTypeFormatted}`,
      start: appointment.scheduledAt,
      end: endTime,
      location: "EEG Monitoring Center", // Can be configured
      attendees: [appointment.parent.email],
    }

    const googleCalendarLink = generateGoogleCalendarLink(calendarEvent)
    const icalContent = generateICalFile(calendarEvent)

    return NextResponse.json({
      googleCalendarLink,
      icalContent,
    })
  } catch (error) {
    console.error("Error generating calendar links:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


