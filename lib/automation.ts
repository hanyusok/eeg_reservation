/**
 * Automation Workflow Manager
 * Handles automated tasks like appointment reminders
 */

import { prisma } from "@/lib/prisma"
import { sendAppointmentReminder } from "@/lib/email"
import { sendAppointmentReminderSMS } from "@/lib/sms"


/**
 * Process appointment reminders
 * Should be run periodically (e.g., via cron job)
 */
export async function processAppointmentReminders(): Promise<void> {
  const now = new Date()
  const reminderTimes = [
    { hours: 48, label: "48 hours" },
    { hours: 24, label: "24 hours" },
  ]

  for (const reminderTime of reminderTimes) {
    const targetTime = new Date(now)
    targetTime.setHours(targetTime.getHours() + reminderTime.hours)

    // Find appointments scheduled for the target time
    const appointments = await prisma.appointment.findMany({
      where: {
        status: "scheduled",
        scheduledAt: {
          gte: new Date(targetTime.getTime() - 60 * 60 * 1000), // 1 hour window
          lte: new Date(targetTime.getTime() + 60 * 60 * 1000),
        },
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        parent: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    })

    for (const appointment of appointments) {
      // Check if reminder already sent
      const existingReminder = await prisma.appointmentReminder.findFirst({
        where: {
          appointmentId: appointment.id,
          reminderType: "email",
          scheduledFor: {
            gte: new Date(targetTime.getTime() - 60 * 60 * 1000),
            lte: new Date(targetTime.getTime() + 60 * 60 * 1000),
          },
          status: "sent",
        },
      })

      if (existingReminder) {
        continue // Reminder already sent
      }

      const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`

      try {
        // Send email reminder
        await sendAppointmentReminder(
          appointment.parent.email,
          {
            appointmentType: appointment.appointmentType,
            scheduledAt: appointment.scheduledAt,
            durationMinutes: appointment.durationMinutes,
            patientName,
          },
          reminderTime.hours
        )

        // Create reminder record
        await prisma.appointmentReminder.create({
          data: {
            appointmentId: appointment.id,
            reminderType: "email",
            scheduledFor: targetTime,
            sentAt: new Date(),
            status: "sent",
          },
        })

        // Send SMS reminder if phone number available
        if (appointment.parent.phone) {
          try {
            await sendAppointmentReminderSMS(appointment.parent.phone, {
              patientName,
              appointmentType: appointment.appointmentType,
              scheduledAt: appointment.scheduledAt,
            })

            await prisma.appointmentReminder.create({
              data: {
                appointmentId: appointment.id,
                reminderType: "sms",
                scheduledFor: targetTime,
                sentAt: new Date(),
                status: "sent",
              },
            })
          } catch (smsError) {
            console.error("SMS reminder failed:", smsError)
            // Don't fail the whole process if SMS fails
          }
        }


      } catch (error) {
        console.error(`Error sending reminder for appointment ${appointment.id}:`, error)

        // Create failed reminder record
        await prisma.appointmentReminder.create({
          data: {
            appointmentId: appointment.id,
            reminderType: "email",
            scheduledFor: targetTime,
            status: "failed",
          },
        })
      }
    }
  }
}

/**
 * Process follow-up emails for completed appointments
 */
export async function processFollowUpEmails(): Promise<void> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find appointments completed yesterday
  const appointments = await prisma.appointment.findMany({
    where: {
      status: "completed",
      scheduledAt: {
        gte: yesterday,
        lt: today,
      },
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      parent: {
        select: {
          email: true,
        },
      },
    },
  })

  for (const appointment of appointments) {
    const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`

    try {
      const { sendFollowUp } = await import("./email")
      await sendFollowUp(appointment.parent.email, {
        appointmentType: appointment.appointmentType,
        scheduledAt: appointment.scheduledAt,
        patientName,
      })


    } catch (error) {
      console.error(`Error sending follow-up for appointment ${appointment.id}:`, error)
    }
  }
}


