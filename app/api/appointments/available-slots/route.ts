import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getEventTypes, getAvailableSlots } from "@/lib/calendly"

// GET /api/appointments/available-slots - Get available time slots from Calendly
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventTypeUri = searchParams.get("eventType")
    const startTime = searchParams.get("startTime")
    const endTime = searchParams.get("endTime")

    // If no event type specified, return all event types
    if (!eventTypeUri) {
      const eventTypes = await getEventTypes()
      return NextResponse.json({ eventTypes })
    }

    // Get available slots for the specified event type
    const slots = await getAvailableSlots(eventTypeUri, startTime || undefined, endTime || undefined)
    
    return NextResponse.json({ slots })
  } catch (error: any) {
    console.error("Error fetching available slots:", error)
    
    // If Calendly API key is not set, return mock data for development
    if (error.message?.includes("CALENDLY_API_KEY")) {
      return NextResponse.json({
        slots: [],
        eventTypes: [],
        message: "Calendly API key not configured. Please set CALENDLY_API_KEY in your .env file.",
      })
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

