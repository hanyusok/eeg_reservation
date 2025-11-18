import { NextRequest, NextResponse } from "next/server"
import { processAppointmentReminders } from "@/lib/automation"

/**
 * POST /api/cron/reminders
 * Process appointment reminders
 * This endpoint should be called periodically (e.g., via cron job or scheduled task)
 * 
 * For security, you should protect this endpoint with a secret token:
 * ?secret=YOUR_CRON_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify secret token for security
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")
    const expectedSecret = process.env.CRON_SECRET

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await processAppointmentReminders()

    return NextResponse.json({
      success: true,
      message: "Appointment reminders processed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing appointment reminders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/reminders
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "Reminders cron endpoint is active",
    timestamp: new Date().toISOString(),
  })
}


