/**
 * Calendly API Integration
 * Documentation: https://developer.calendly.com/api-docs
 */

const CALENDLY_API_BASE = "https://api.calendly.com"

export interface CalendlyEventType {
  uri: string
  name: string
  active: boolean
  slug: string
  scheduling_url: string
  duration: number
  kind: string
  pooling_type: string | null
  type: string
  color: string
  created_at: string
  updated_at: string
  internal_note: string | null
  description_plain: string | null
  description_html: string | null
  profile: {
    type: string
    name: string
    owner: string
  }
  secret: boolean
  booking_methods: string[]
  custom_questions: Array<{
    name: string
    type: string
    position: number
    enabled: boolean
    required: boolean
    answer_choices: string[]
    include_other: boolean
  }>
  deleted_at: string | null
}

export interface CalendlyEvent {
  uri: string
  name: string
  status: string
  start_time: string
  end_time: string
  event_type: string
  location: {
    type: string
    location: string | null
    phone_number: string | null
    additional_info: string | null
  }
  invitees_counter: {
    total: number
    active: number
    limit: number
  }
  created_at: string
  updated_at: string
  event_memberships: Array<{
    user: string
    user_email: string
    user_name: string
  }>
  event_guests: Array<{
    email: string
    created_at: string
    updated_at: string
  }>
  calendar_event: {
    kind: string
    external_id: string
  } | null
}

export interface CalendlyInvitee {
  uri: string
  name: string
  email: string
  text_reminder_number: string | null
  timezone: string
  event: string
  created_at: string
  updated_at: string
  canceled: boolean
  cancellation: {
    canceled_by: string
    reason: string
    canceler_type: string
    created_at: string
  } | null
  payment: {
    external_id: string
    provider: string
    amount: number
    currency: string
    terms: string
    successful: boolean
  } | null
  tracking: {
    utm_campaign: string | null
    utm_source: string | null
    utm_medium: string | null
    utm_content: string | null
    utm_term: string | null
    salesforce_uuid: string | null
  }
  questions_and_answers: Array<{
    question: string
    answer: string
    position: number
  }>
  questions_and_answers_type: string
  scheduling_method: string | null
}

/**
 * Get Calendly API access token from environment
 */
function getCalendlyToken(): string {
  const token = process.env.CALENDLY_API_KEY
  if (!token) {
    throw new Error("CALENDLY_API_KEY is not set in environment variables")
  }
  return token
}

/**
 * Make authenticated request to Calendly API
 */
async function calendlyRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getCalendlyToken()
  const url = `${CALENDLY_API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(`Calendly API error: ${error.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Get list of event types (appointment types)
 */
export async function getEventTypes(): Promise<CalendlyEventType[]> {
  const response = await calendlyRequest<{ collection: CalendlyEventType[] }>(
    "/event_types?user=https://api.calendly.com/users/me"
  )
  return response.collection
}

/**
 * Get available time slots for a specific event type
 */
export async function getAvailableSlots(
  eventTypeUri: string,
  startTime?: string,
  endTime?: string
): Promise<CalendlyEvent[]> {
  const params = new URLSearchParams({
    event_type: eventTypeUri,
    ...(startTime && { start_time: startTime }),
    ...(endTime && { end_time: endTime }),
  })

  const response = await calendlyRequest<{ collection: CalendlyEvent[] }>(
    `/event_type_available_times?${params.toString()}`
  )
  return response.collection
}

/**
 * Get event details by URI
 */
export async function getEvent(eventUri: string): Promise<CalendlyEvent> {
  const response = await calendlyRequest<{ resource: CalendlyEvent }>(eventUri)
  return response.resource
}

/**
 * Get invitee details
 */
export async function getInvitee(inviteeUri: string): Promise<CalendlyInvitee> {
  const response = await calendlyRequest<{ resource: CalendlyInvitee }>(inviteeUri)
  return response.resource
}

/**
 * Create a Calendly scheduling link
 */
export function createSchedulingLink(eventTypeUri: string, prefill?: {
  name?: string
  email?: string
  customAnswers?: Record<string, string>
}): string {
  const baseUrl = eventTypeUri.replace("/api/v1/event_types/", "").replace("https://api.calendly.com/", "")
  const url = new URL(`https://calendly.com/${baseUrl}`)
  
  if (prefill) {
    if (prefill.name) url.searchParams.set("name", prefill.name)
    if (prefill.email) url.searchParams.set("email", prefill.email)
  }
  
  return url.toString()
}

/**
 * Verify webhook signature from Calendly
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY
  if (!signingKey) {
    console.warn("CALENDLY_WEBHOOK_SIGNING_KEY not set, skipping verification")
    return true
  }

  // Calendly uses HMAC SHA256 for webhook verification
  const crypto = require("crypto")
  const hmac = crypto.createHmac("sha256", signingKey)
  hmac.update(timestamp + payload)
  const expectedSignature = hmac.digest("hex")

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

