/**
 * Calendar Integration
 * Supports Google Calendar sync
 */

export interface CalendarEvent {
  summary: string
  description: string
  start: Date
  end: Date
  location?: string
  attendees?: string[]
}

/**
 * Create calendar event (Google Calendar)
 */
export async function createCalendarEvent(
  event: CalendarEvent
): Promise<string | null> {
  // In development, just log the event
  if (process.env.NODE_ENV === "development") {
    console.log("📅 Calendar event would be created:", {
      summary: event.summary,
      start: event.start,
      end: event.end,
    })
    return null
  }

  // Google Calendar integration would go here
  // This requires OAuth2 setup and Google Calendar API
  /*
  if (process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET) {
    // Implement Google Calendar API integration
    // Requires OAuth2 authentication flow
  }
  */

  console.warn("Calendar integration not configured")
  return null
}

/**
 * Generate Google Calendar link
 */
export function generateGoogleCalendarLink(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.summary,
    dates: `${formatDate(event.start)}/${formatDate(event.end)}`,
    details: event.description,
    ...(event.location && { location: event.location }),
  })

  if (event.attendees && event.attendees.length > 0) {
    params.append("add", event.attendees.join(","))
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate iCal file content
 */
export function generateICalFile(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const uid = `appointment-${Date.now()}@eeg-reservation.com`
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EEG Reservation System//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatDate(event.start)}
DTEND:${formatDate(event.end)}
SUMMARY:${event.summary.replace(/\n/g, "\\n")}
DESCRIPTION:${event.description.replace(/\n/g, "\\n")}
${event.location ? `LOCATION:${event.location}` : ""}
END:VEVENT
END:VCALENDAR`
}


