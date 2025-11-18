import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhookSignature } from "@/lib/calendly"

/**
 * POST /api/webhooks/calendly
 * Handle Calendly webhook events
 * Documentation: https://developer.calendly.com/api-docs/ZG9jOjM2MzE2MDM4-webhook-signatures
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("calendly-webhook-signature")
    const timestamp = request.headers.get("calendly-webhook-timestamp")

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: "Missing webhook signature or timestamp" },
        { status: 401 }
      )
    }

    const payload = await request.text()

    // Verify webhook signature
    const isValid = verifyWebhookSignature(payload, signature, timestamp)
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      )
    }

    const event = JSON.parse(payload)

    // Handle different event types
    switch (event.event) {
      case "invitee.created":
        await handleInviteeCreated(event)
        break
      case "invitee.canceled":
        await handleInviteeCanceled(event)
        break
      case "invitee.updated":
        await handleInviteeUpdated(event)
        break
      default:
        console.log(`Unhandled Calendly event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Calendly webhook:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function handleInviteeCreated(event: any) {
  try {
    const invitee = event.payload.invitee
    const eventData = event.payload.event

    // Find or create appointment based on Calendly event
    const appointment = await prisma.appointment.findFirst({
      where: {
        calendlyEventId: eventData.uri,
      },
    })

    if (appointment) {
      // Update existing appointment
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          scheduledAt: new Date(eventData.start_time),
          status: "scheduled",
        },
      })
    } else {
      // Create new appointment if not found
      // Note: This requires matching the invitee email to a patient/parent
      // For now, we'll just log it
      console.log("New Calendly appointment created:", {
        inviteeEmail: invitee.email,
        eventUri: eventData.uri,
        startTime: eventData.start_time,
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "calendly_invitee_created",
        entityType: "appointment",
        entityId: appointment?.id || "unknown",
        details: {
          inviteeEmail: invitee.email,
          eventUri: eventData.uri,
          startTime: eventData.start_time,
        },
      },
    })
  } catch (error) {
    console.error("Error handling invitee.created:", error)
  }
}

async function handleInviteeCanceled(event: any) {
  try {
    const invitee = event.payload.invitee
    const eventData = event.payload.event

    // Find appointment by Calendly event ID
    const appointment = await prisma.appointment.findFirst({
      where: {
        calendlyEventId: eventData.uri,
      },
    })

    if (appointment) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "cancelled",
        },
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "calendly_invitee_canceled",
        entityType: "appointment",
        entityId: appointment?.id || "unknown",
        details: {
          inviteeEmail: invitee.email,
          eventUri: eventData.uri,
        },
      },
    })
  } catch (error) {
    console.error("Error handling invitee.canceled:", error)
  }
}

async function handleInviteeUpdated(event: any) {
  try {
    const invitee = event.payload.invitee
    const eventData = event.payload.event

    // Find appointment by Calendly event ID
    const appointment = await prisma.appointment.findFirst({
      where: {
        calendlyEventId: eventData.uri,
      },
    })

    if (appointment) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          scheduledAt: new Date(eventData.start_time),
          status: "rescheduled",
        },
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "calendly_invitee_updated",
        entityType: "appointment",
        entityId: appointment?.id || "unknown",
        details: {
          inviteeEmail: invitee.email,
          eventUri: eventData.uri,
          startTime: eventData.start_time,
        },
      },
    })
  } catch (error) {
    console.error("Error handling invitee.updated:", error)
  }
}

