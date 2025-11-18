/**
 * Email Notification System
 * Supports Resend, SendGrid, or SMTP
 */

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email notification
 * Supports multiple email providers
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const emailProvider = process.env.EMAIL_PROVIDER || "console"

  // In development, just log the email
  if (process.env.NODE_ENV === "development" && emailProvider === "console") {
    console.log("📧 Email would be sent:", {
      to: options.to,
      subject: options.subject,
      html: options.html.substring(0, 200) + "...",
    })
    return
  }

  // Resend integration
  if (emailProvider === "resend" && process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "noreply@example.com",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })
      return
    } catch (error) {
      console.error("Resend email error:", error)
      throw error
    }
  }

  // SendGrid integration
  if (emailProvider === "sendgrid" && process.env.SENDGRID_API_KEY) {
    try {
      const sgMail = await import("@sendgrid/mail")
      sgMail.default.setApiKey(process.env.SENDGRID_API_KEY)
      await sgMail.default.send({
        from: process.env.EMAIL_FROM || "noreply@example.com",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })
      return
    } catch (error) {
      console.error("SendGrid email error:", error)
      throw error
    }
  }

  // SMTP integration (using nodemailer)
  if (emailProvider === "smtp") {
    try {
      const nodemailer = await import("nodemailer")
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })
      return
    } catch (error) {
      console.error("SMTP email error:", error)
      throw error
    }
  }

  // Fallback: log in development, throw in production
  if (process.env.NODE_ENV === "development") {
    console.warn("Email service not configured. Email would be sent to:", options.to)
    return
  }

  throw new Error(
    "Email service not configured. Set EMAIL_PROVIDER and required credentials in environment variables."
  )
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmation(
  email: string,
  appointment: {
    appointmentType: string
    scheduledAt: Date
    durationMinutes: number
    patientName: string
    appointmentId?: string
  }
): Promise<void> {
  const { getAppointmentConfirmationTemplate } = await import("./email-templates")
  const template = getAppointmentConfirmationTemplate({
    patientName: appointment.patientName,
    appointmentType: appointment.appointmentType,
    scheduledAt: appointment.scheduledAt,
    durationMinutes: appointment.durationMinutes,
    appointmentId: appointment.appointmentId,
  })

  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminder(
  email: string,
  appointment: {
    appointmentType: string
    scheduledAt: Date
    durationMinutes: number
    patientName: string
  },
  hoursBefore: number = 48
): Promise<void> {
  const { getAppointmentReminderTemplate } = await import("./email-templates")
  const template = getAppointmentReminderTemplate(
    {
      patientName: appointment.patientName,
      appointmentType: appointment.appointmentType,
      scheduledAt: appointment.scheduledAt,
      durationMinutes: appointment.durationMinutes,
    },
    hoursBefore
  )

  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send appointment cancellation email
 */
export async function sendAppointmentCancellation(
  email: string,
  appointment: {
    appointmentType: string
    scheduledAt: Date
    patientName: string
    cancellationReason?: string
  }
): Promise<void> {
  const { getAppointmentCancellationTemplate } = await import("./email-templates")
  const template = getAppointmentCancellationTemplate({
    patientName: appointment.patientName,
    appointmentType: appointment.appointmentType,
    scheduledAt: appointment.scheduledAt,
    durationMinutes: 0, // Not needed for cancellation
    cancellationReason: appointment.cancellationReason,
  })

  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send appointment rescheduled email
 */
export async function sendAppointmentRescheduled(
  email: string,
  appointment: {
    appointmentType: string
    scheduledAt: Date
    rescheduleDate: Date
    durationMinutes: number
    patientName: string
  }
): Promise<void> {
  const { getAppointmentRescheduledTemplate } = await import("./email-templates")
  const template = getAppointmentRescheduledTemplate({
    patientName: appointment.patientName,
    appointmentType: appointment.appointmentType,
    scheduledAt: appointment.scheduledAt,
    durationMinutes: appointment.durationMinutes,
    rescheduleDate: appointment.rescheduleDate,
  })

  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send follow-up email
 */
export async function sendFollowUp(
  email: string,
  appointment: {
    appointmentType: string
    scheduledAt: Date
    patientName: string
  }
): Promise<void> {
  const { getFollowUpTemplate } = await import("./email-templates")
  const template = getFollowUpTemplate({
    patientName: appointment.patientName,
    appointmentType: appointment.appointmentType,
    scheduledAt: appointment.scheduledAt,
    durationMinutes: 0, // Not needed for follow-up
  })

  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

