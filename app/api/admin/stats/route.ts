import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get statistics
    const [
      totalPatients,
      totalAppointments,
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          scheduledAt: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            not: "cancelled",
          },
        },
      }),
      prisma.appointment.count({
        where: {
          scheduledAt: {
            gte: tomorrow,
          },
          status: "scheduled",
        },
      }),
      prisma.appointment.count({
        where: {
          status: "completed",
        },
      }),
      prisma.appointment.count({
        where: {
          status: "cancelled",
        },
      }),
    ])

    return NextResponse.json({
      totalPatients,
      totalAppointments,
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

