import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, addMinutes, format, isSameDay, parse, isWithinInterval } from "date-fns"

// GET /api/appointments/available-slots - Get available time slots from local DB
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startTimeStr = searchParams.get("startTime")
    const endTimeStr = searchParams.get("endTime")

    if (!startTimeStr || !endTimeStr) {
      return NextResponse.json({ error: "Start and end time required" }, { status: 400 })
    }

    const startDate = new Date(startTimeStr)
    const endDate = new Date(endTimeStr)

    // 1. Find a provider (Admin or Doctor) to check availability for
    // In a multi-provider system, we would accept a providerId param
    const provider = await prisma.user.findFirst({
      where: {
        role: { in: ["admin", "doctor"] },
      },
      include: {
        availability: true,
        blockedDates: {
          where: {
            date: {
              gte: startOfDay(startDate),
              lte: endOfDay(endDate),
            },
          },
        },
      },
    })

    if (!provider) {
      return NextResponse.json({ slots: [], message: "No provider found" })
    }

    // 2. Get existing appointments to check for conflicts
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        status: { not: "cancelled" },
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // 3. Generate slots based on Weekly Availability
    const slots: string[] = []
    const cursor = new Date(startDate)

    // Iterate through each day in the range
    while (cursor <= endDate) {
      const dayOfWeek = cursor.getDay() // 0-6
      const dailyConfig = provider.availability.find((a) => a.dayOfWeek === dayOfWeek)

      // Skip if no config for this day or disabled
      if (!dailyConfig || !dailyConfig.isEnabled) {
        cursor.setDate(cursor.getDate() + 1)
        continue
      }

      // Check if this specific date is blocked
      const isBlocked = provider.blockedDates.some((b) => isSameDay(b.date, cursor))
      if (isBlocked) {
        cursor.setDate(cursor.getDate() + 1)
        continue
      }

      // Generate slots for this day
      // Parse start/end times (e.g. "09:00")
      const [startHour, startMinute] = dailyConfig.startTime.split(":").map(Number)
      const [endHour, endMinute] = dailyConfig.endTime.split(":").map(Number)

      const slotCursor = new Date(cursor)
      slotCursor.setHours(startHour, startMinute, 0, 0)

      const dayEndTime = new Date(cursor)
      dayEndTime.setHours(endHour, endMinute, 0, 0)

      // 60-minute duration standard
      const slotDuration = 60

      while (slotCursor < dayEndTime) {
        const slotEnd = addMinutes(slotCursor, slotDuration)

        // Check if slot exceeds day end
        if (slotEnd > dayEndTime) break

        // Check conflicts with existing appointments
        const hasConflict = existingAppointments.some((appt) => {
          const apptStart = new Date(appt.scheduledAt)
          const apptEnd = addMinutes(apptStart, appt.durationMinutes)

          return (
            isWithinInterval(slotCursor, { start: apptStart, end: apptEnd }) ||
            isWithinInterval(slotEnd, { start: apptStart, end: apptEnd }) ||
            (slotCursor <= apptStart && slotEnd >= apptEnd)
          )
        })

        if (!hasConflict) {
          slots.push(slotCursor.toISOString())
        }

        // Move to next slot
        slotCursor.setTime(slotCursor.getTime() + slotDuration * 60 * 1000)
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    return NextResponse.json({ slots })
  } catch (error: any) {
    console.error("Error fetching available slots:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

