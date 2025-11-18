/**
 * Email Template System
 * Centralized email templates for consistent branding and messaging
 */

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface AppointmentEmailData {
  patientName: string
  appointmentType: string
  scheduledAt: Date
  durationMinutes: number
  appointmentId?: string
  cancellationReason?: string
  rescheduleDate?: Date
}

/**
 * Base email template with branding
 */
function getBaseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <h1 style="margin: 0;">EEG Monitoring System</h1>
      </div>
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px;">
        ${content}
      </div>
      <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
        <p>This is an automated message from the EEG Monitoring System.</p>
        <p>Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Appointment Confirmation Template
 */
export function getAppointmentConfirmationTemplate(
  data: AppointmentEmailData
): EmailTemplate {
  const formattedDate = new Date(data.scheduledAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const appointmentTypeFormatted = data.appointmentType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const content = `
    <h2 style="color: #2563eb; margin-top: 0;">Appointment Confirmation</h2>
    <p>Dear Parent/Guardian,</p>
    <p>This email confirms your appointment has been scheduled:</p>
    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 5px 0;"><strong>Patient:</strong> ${data.patientName}</p>
      <p style="margin: 5px 0;"><strong>Appointment Type:</strong> ${appointmentTypeFormatted}</p>
      <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
      <p style="margin: 5px 0;"><strong>Duration:</strong> ${data.durationMinutes} minutes</p>
      ${data.appointmentId ? `<p style="margin: 5px 0;"><strong>Appointment ID:</strong> ${data.appointmentId}</p>` : ""}
    </div>
    <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>⚠️ Important:</strong> Please arrive 15 minutes before your scheduled appointment time.</p>
    </div>
    <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance through the patient portal or by calling our office.</p>
    <p>Best regards,<br><strong>EEG Monitoring Team</strong></p>
  `

  return {
    subject: `Appointment Confirmation - ${appointmentTypeFormatted}`,
    html: getBaseTemplate(content),
    text: `
Appointment Confirmation

Dear Parent/Guardian,

This email confirms your appointment has been scheduled:

Patient: ${data.patientName}
Appointment Type: ${appointmentTypeFormatted}
Date & Time: ${formattedDate}
Duration: ${data.durationMinutes} minutes
${data.appointmentId ? `Appointment ID: ${data.appointmentId}` : ""}

IMPORTANT: Please arrive 15 minutes before your scheduled appointment time.

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Best regards,
EEG Monitoring Team
    `.trim(),
  }
}

/**
 * Appointment Reminder Template
 */
export function getAppointmentReminderTemplate(
  data: AppointmentEmailData,
  hoursBefore: number = 48
): EmailTemplate {
  const formattedDate = new Date(data.scheduledAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const appointmentTypeFormatted = data.appointmentType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const content = `
    <h2 style="color: #2563eb; margin-top: 0;">Appointment Reminder</h2>
    <p>Dear Parent/Guardian,</p>
    <p>This is a reminder about your upcoming appointment in ${hoursBefore} hours:</p>
    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 5px 0;"><strong>Patient:</strong> ${data.patientName}</p>
      <p style="margin: 5px 0;"><strong>Appointment Type:</strong> ${appointmentTypeFormatted}</p>
      <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
      <p style="margin: 5px 0;"><strong>Duration:</strong> ${data.durationMinutes} minutes</p>
    </div>
    <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>⚠️ Reminder:</strong> Please arrive 15 minutes before your scheduled appointment time.</p>
    </div>
    <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
    <p>Best regards,<br><strong>EEG Monitoring Team</strong></p>
  `

  return {
    subject: `Appointment Reminder - ${appointmentTypeFormatted} (${hoursBefore}h before)`,
    html: getBaseTemplate(content),
    text: `
Appointment Reminder

Dear Parent/Guardian,

This is a reminder about your upcoming appointment in ${hoursBefore} hours:

Patient: ${data.patientName}
Appointment Type: ${appointmentTypeFormatted}
Date & Time: ${formattedDate}
Duration: ${data.durationMinutes} minutes

REMINDER: Please arrive 15 minutes before your scheduled appointment time.

If you need to reschedule or cancel, please contact us as soon as possible.

Best regards,
EEG Monitoring Team
    `.trim(),
  }
}

/**
 * Appointment Cancellation Template
 */
export function getAppointmentCancellationTemplate(
  data: AppointmentEmailData
): EmailTemplate {
  const formattedDate = new Date(data.scheduledAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const appointmentTypeFormatted = data.appointmentType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const content = `
    <h2 style="color: #dc2626; margin-top: 0;">Appointment Cancelled</h2>
    <p>Dear Parent/Guardian,</p>
    <p>Your appointment has been cancelled:</p>
    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <p style="margin: 5px 0;"><strong>Patient:</strong> ${data.patientName}</p>
      <p style="margin: 5px 0;"><strong>Appointment Type:</strong> ${appointmentTypeFormatted}</p>
      <p style="margin: 5px 0;"><strong>Original Date & Time:</strong> ${formattedDate}</p>
      ${data.cancellationReason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${data.cancellationReason}</p>` : ""}
    </div>
    <p>If you would like to reschedule, please contact us or book a new appointment through the patient portal.</p>
    <p>Best regards,<br><strong>EEG Monitoring Team</strong></p>
  `

  return {
    subject: `Appointment Cancelled - ${appointmentTypeFormatted}`,
    html: getBaseTemplate(content),
    text: `
Appointment Cancelled

Dear Parent/Guardian,

Your appointment has been cancelled:

Patient: ${data.patientName}
Appointment Type: ${appointmentTypeFormatted}
Original Date & Time: ${formattedDate}
${data.cancellationReason ? `Reason: ${data.cancellationReason}` : ""}

If you would like to reschedule, please contact us or book a new appointment through the patient portal.

Best regards,
EEG Monitoring Team
    `.trim(),
  }
}

/**
 * Appointment Rescheduled Template
 */
export function getAppointmentRescheduledTemplate(
  data: AppointmentEmailData
): EmailTemplate {
  const originalDate = new Date(data.scheduledAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const newDate = data.rescheduleDate
    ? new Date(data.rescheduleDate).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBD"

  const appointmentTypeFormatted = data.appointmentType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const content = `
    <h2 style="color: #f59e0b; margin-top: 0;">Appointment Rescheduled</h2>
    <p>Dear Parent/Guardian,</p>
    <p>Your appointment has been rescheduled:</p>
    <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 5px 0;"><strong>Patient:</strong> ${data.patientName}</p>
      <p style="margin: 5px 0;"><strong>Appointment Type:</strong> ${appointmentTypeFormatted}</p>
      <p style="margin: 5px 0;"><strong>Original Date & Time:</strong> ${originalDate}</p>
      <p style="margin: 5px 0;"><strong>New Date & Time:</strong> ${newDate}</p>
      <p style="margin: 5px 0;"><strong>Duration:</strong> ${data.durationMinutes} minutes</p>
    </div>
    <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>⚠️ Note:</strong> Please arrive 15 minutes before your new scheduled appointment time.</p>
    </div>
    <p>If you have any questions or need to make further changes, please contact us.</p>
    <p>Best regards,<br><strong>EEG Monitoring Team</strong></p>
  `

  return {
    subject: `Appointment Rescheduled - ${appointmentTypeFormatted}`,
    html: getBaseTemplate(content),
    text: `
Appointment Rescheduled

Dear Parent/Guardian,

Your appointment has been rescheduled:

Patient: ${data.patientName}
Appointment Type: ${appointmentTypeFormatted}
Original Date & Time: ${originalDate}
New Date & Time: ${newDate}
Duration: ${data.durationMinutes} minutes

NOTE: Please arrive 15 minutes before your new scheduled appointment time.

If you have any questions or need to make further changes, please contact us.

Best regards,
EEG Monitoring Team
    `.trim(),
  }
}

/**
 * Follow-up Template
 */
export function getFollowUpTemplate(data: AppointmentEmailData): EmailTemplate {
  const formattedDate = new Date(data.scheduledAt).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const appointmentTypeFormatted = data.appointmentType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const content = `
    <h2 style="color: #2563eb; margin-top: 0;">Follow-up</h2>
    <p>Dear Parent/Guardian,</p>
    <p>Thank you for visiting us for your ${appointmentTypeFormatted} appointment on ${formattedDate}.</p>
    <p>We hope everything went well. If you have any questions or concerns, please don't hesitate to contact us.</p>
    <p>If you need to schedule a follow-up appointment, you can do so through the patient portal.</p>
    <p>Best regards,<br><strong>EEG Monitoring Team</strong></p>
  `

  return {
    subject: `Follow-up - ${appointmentTypeFormatted}`,
    html: getBaseTemplate(content),
    text: `
Follow-up

Dear Parent/Guardian,

Thank you for visiting us for your ${appointmentTypeFormatted} appointment on ${formattedDate}.

We hope everything went well. If you have any questions or concerns, please don't hesitate to contact us.

If you need to schedule a follow-up appointment, you can do so through the patient portal.

Best regards,
EEG Monitoring Team
    `.trim(),
  }
}


