/**
 * SMS Notification System
 * Supports Twilio for SMS notifications
 */

export interface SMSOptions {
  to: string
  message: string
}

/**
 * Send SMS notification
 */
export async function sendSMS(options: SMSOptions): Promise<void> {
  const smsProvider = process.env.SMS_PROVIDER || "console"

  // In development, just log the SMS
  if (process.env.NODE_ENV === "development" && smsProvider === "console") {
    console.log("📱 SMS would be sent:", {
      to: options.to,
      message: options.message,
    })
    return
  }

  // Twilio integration
  if (smsProvider === "twilio" && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = await import("twilio")
      const client = twilio.default(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )

      await client.messages.create({
        body: options.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: options.to,
      })
      return
    } catch (error) {
      console.error("Twilio SMS error:", error)
      throw error
    }
  }

  // Fallback: log in development, throw in production
  if (process.env.NODE_ENV === "development") {
    console.warn("SMS service not configured. SMS would be sent to:", options.to)
    return
  }

  throw new Error(
    "SMS service not configured. Set SMS_PROVIDER and required credentials in environment variables."
  )
}

/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminderSMS(
  phone: string,
  appointment: {
    patientName: string
    appointmentType: string
    scheduledAt: Date
  }
): Promise<void> {
  const formattedDate = new Date(appointment.scheduledAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const appointmentTypeFormatted = appointment.appointmentType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const message = `Reminder: ${appointment.patientName} has an ${appointmentTypeFormatted} appointment on ${formattedDate}. Please arrive 15 minutes early.`

  await sendSMS({
    to: phone,
    message,
  })
}


