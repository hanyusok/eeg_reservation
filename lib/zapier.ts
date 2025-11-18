/**
 * Zapier Integration
 * Handles webhook triggers for automation workflows
 */

export interface ZapierWebhookPayload {
  event: string
  data: any
  timestamp: string
}

/**
 * Trigger Zapier webhook
 */
export async function triggerZapierWebhook(
  event: string,
  data: any
): Promise<void> {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL

  if (!webhookUrl) {
    // In development, just log the webhook
    if (process.env.NODE_ENV === "development") {
      console.log("🔔 Zapier webhook would be triggered:", {
        event,
        data,
        webhookUrl: "not configured",
      })
      return
    }
    // In production, fail silently if not configured
    console.warn("Zapier webhook URL not configured")
    return
  }

  try {
    const payload: ZapierWebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`Zapier webhook failed: ${response.statusText}`)
    }
  } catch (error) {
    console.error("Error triggering Zapier webhook:", error)
    // Don't throw - webhook failures shouldn't break the main flow
  }
}

/**
 * Automation Workflow Triggers
 */

export async function triggerNewAppointmentWorkflow(appointment: {
  id: string
  patientName: string
  parentEmail: string
  appointmentType: string
  scheduledAt: Date
  durationMinutes: number
}): Promise<void> {
  await triggerZapierWebhook("appointment.created", {
    appointmentId: appointment.id,
    patientName: appointment.patientName,
    parentEmail: appointment.parentEmail,
    appointmentType: appointment.appointmentType,
    scheduledAt: appointment.scheduledAt.toISOString(),
    durationMinutes: appointment.durationMinutes,
  })
}

export async function triggerAppointmentReminderWorkflow(appointment: {
  id: string
  patientName: string
  parentEmail: string
  parentPhone?: string
  appointmentType: string
  scheduledAt: Date
  durationMinutes: number
}): Promise<void> {
  await triggerZapierWebhook("appointment.reminder", {
    appointmentId: appointment.id,
    patientName: appointment.patientName,
    parentEmail: appointment.parentEmail,
    parentPhone: appointment.parentPhone,
    appointmentType: appointment.appointmentType,
    scheduledAt: appointment.scheduledAt.toISOString(),
    durationMinutes: appointment.durationMinutes,
    reminderHours: 48, // 48 hours before appointment
  })
}

export async function triggerAppointmentCancellationWorkflow(appointment: {
  id: string
  patientName: string
  parentEmail: string
  appointmentType: string
  scheduledAt: Date
  reason?: string
}): Promise<void> {
  await triggerZapierWebhook("appointment.cancelled", {
    appointmentId: appointment.id,
    patientName: appointment.patientName,
    parentEmail: appointment.parentEmail,
    appointmentType: appointment.appointmentType,
    scheduledAt: appointment.scheduledAt.toISOString(),
    reason: appointment.reason,
  })
}

export async function triggerFollowUpWorkflow(appointment: {
  id: string
  patientName: string
  parentEmail: string
  appointmentType: string
  completedAt: Date
}): Promise<void> {
  await triggerZapierWebhook("appointment.completed", {
    appointmentId: appointment.id,
    patientName: appointment.patientName,
    parentEmail: appointment.parentEmail,
    appointmentType: appointment.appointmentType,
    completedAt: appointment.completedAt.toISOString(),
  })
}


