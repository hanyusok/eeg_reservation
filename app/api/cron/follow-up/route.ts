import { NextRequest, NextResponse } from "next/server"
import { processFollowUpEmails } from "@/lib/automation"

/**
 * POST /api/cron/follow-up
 * Process follow-up emails for completed appointments
 * This endpoint should be called daily (e.g., via cron job)
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

    await processFollowUpEmails()

    return NextResponse.json({
      success: true,
      message: "Follow-up emails processed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing follow-up emails:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/follow-up
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "Follow-up cron endpoint is active",
    timestamp: new Date().toISOString(),
  })
}


