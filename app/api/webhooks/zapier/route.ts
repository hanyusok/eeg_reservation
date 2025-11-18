import { NextRequest, NextResponse } from "next/server"
import { triggerZapierWebhook } from "@/lib/zapier"

/**
 * POST /api/webhooks/zapier
 * Receive webhook from Zapier (for two-way communication)
 * This endpoint can be used if Zapier needs to send data back to the system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle incoming webhook from Zapier
    // This could be used for:
    // - Status updates from Zapier workflows
    // - Data synchronization
    // - Workflow completion notifications

    console.log("Received webhook from Zapier:", body)

    // Process the webhook data as needed
    // For now, just acknowledge receipt

    return NextResponse.json({ received: true, message: "Webhook received" })
  } catch (error) {
    console.error("Error processing Zapier webhook:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/zapier
 * Health check endpoint for Zapier
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    message: "Zapier webhook endpoint is active",
    timestamp: new Date().toISOString(),
  })
}


