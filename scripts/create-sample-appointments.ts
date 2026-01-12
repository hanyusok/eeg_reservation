/**
 * Script to create 50 random sample appointments for testing
 * Run with: npx tsx scripts/create-sample-appointments.ts
 * 
 * Environment variables:
 * - APPOINTMENT_COUNT: Number of appointments to create (default: 50)
 */

import { PrismaClient, AppointmentType, AppointmentStatus } from "@prisma/client"

const prisma = new PrismaClient()

// Appointment types
const appointmentTypes: AppointmentType[] = [
  "initial_consultation",
  "eeg_monitoring",
  "follow_up",
]

// Appointment statuses
const appointmentStatuses: AppointmentStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
  "rescheduled",
]

// Sample notes
const sampleNotes = [
  "Regular check-up appointment",
  "Follow-up after previous consultation",
  "Routine EEG monitoring session",
  "Patient requested this time slot",
  "Initial consultation for new patient",
  "Follow-up on medication adjustment",
  "EEG monitoring for seizure evaluation",
  "Regular monitoring appointment",
  "Patient has concerns about symptoms",
  "Scheduled for comprehensive evaluation",
  null, // Some appointments may not have notes
  null,
  null,
]

// Duration options (in minutes)
const durationOptions = [30, 45, 60, 90, 120]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a random date within the specified range
 * @param startDays Number of days from today (can be negative for past dates)
 * @param endDays Number of days from today
 */
function generateRandomDate(startDays: number = -30, endDays: number = 90): Date {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() + startDays)
  
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + endDays)
  
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
  const randomDate = new Date(randomTime)
  
  // Round to nearest 15 minutes
  const minutes = randomDate.getMinutes()
  const roundedMinutes = Math.round(minutes / 15) * 15
  randomDate.setMinutes(roundedMinutes)
  randomDate.setSeconds(0)
  randomDate.setMilliseconds(0)
  
  return randomDate
}

/**
 * Generate appointment status based on scheduled date
 * Past dates are more likely to be completed or cancelled
 * Future dates are more likely to be scheduled
 */
function generateStatusForDate(scheduledAt: Date): AppointmentStatus {
  const now = new Date()
  const isPast = scheduledAt < now
  
  if (isPast) {
    // Past appointments: 60% completed, 30% cancelled, 10% rescheduled
    const rand = Math.random()
    if (rand < 0.6) return "completed"
    if (rand < 0.9) return "cancelled"
    return "rescheduled"
  } else {
    // Future appointments: 85% scheduled, 10% cancelled, 5% rescheduled
    const rand = Math.random()
    if (rand < 0.85) return "scheduled"
    if (rand < 0.95) return "cancelled"
    return "rescheduled"
  }
}

async function createSampleAppointments() {
  const count = parseInt(process.env.APPOINTMENT_COUNT || "50")

  console.log(`Creating ${count} random sample appointments...\n`)

  try {
    // Get all patients with their parent information
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        parent: {
          select: {
            id: true,
          },
        },
      },
    })

    if (patients.length === 0) {
      console.log("⚠️  No patients found. Creating sample patients first...\n")
      
      // Get all users to use as patients or create new ones
      const users = await prisma.user.findMany({
        where: {
          role: {
            in: ["patient", "parent"],
          },
        },
        take: 10, // Use up to 10 existing users
      })

      if (users.length === 0) {
        console.error("❌ No users found in the database!")
        console.error("Please create users first using:")
        console.error("  npm run create-sample-users")
        process.exit(1)
      }

      // Create patient profiles for existing users
      for (const user of users) {
        // Check if patient already exists
        const existingPatient = await prisma.patient.findUnique({
          where: { userId: user.id },
        })

        if (existingPatient) {
          continue
        }

        // Determine parentId
        let parentId: string | undefined = undefined
        if (user.role === "parent") {
          parentId = user.id
        } else {
          // Find a parent user
          const parentUser = await prisma.user.findFirst({
            where: { role: "parent" },
          })
          if (parentUser) {
            parentId = parentUser.id
          }
        }

        // Generate random date of birth (between 1 and 18 years ago)
        const yearsAgo = Math.floor(Math.random() * 17) + 1
        const dateOfBirth = new Date()
        dateOfBirth.setFullYear(dateOfBirth.getFullYear() - yearsAgo)
        dateOfBirth.setMonth(Math.floor(Math.random() * 12))
        dateOfBirth.setDate(Math.floor(Math.random() * 28) + 1)

        // Create patient
        await prisma.patient.create({
          data: {
            userId: user.id,
            parentId: parentId,
            dateOfBirth,
            emergencyContactName: `${user.firstName} ${user.lastName}`,
            emergencyContactPhone: `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`,
          },
        })

        console.log(`  ✅ Created patient profile for ${user.firstName} ${user.lastName}`)
      }

      // Reload patients
      const updatedPatients = await prisma.patient.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          parent: {
            select: {
              id: true,
            },
          },
        },
      })

      if (updatedPatients.length === 0) {
        console.error("❌ Failed to create patients!")
        process.exit(1)
      }

      patients.push(...updatedPatients)
      console.log(`\n✅ Created ${updatedPatients.length} patient profiles\n`)
    }

    console.log(`Found ${patients.length} patients in the database\n`)

    const createdAppointments: Array<{
      id: string
      patientName: string
      appointmentType: AppointmentType
      scheduledAt: Date
      status: AppointmentStatus
    }> = []

    // Create appointments
    for (let i = 0; i < count; i++) {
      // Select a random patient
      const patient = getRandomElement(patients)
      
      // Determine parentId (use parent if exists, otherwise use patient's userId)
      const parentId = patient.parentId || patient.userId
      
      // Generate random appointment data
      const appointmentType = getRandomElement(appointmentTypes)
      const scheduledAt = generateRandomDate(-60, 120) // Past 60 days to future 120 days
      const status = generateStatusForDate(scheduledAt)
      const durationMinutes = getRandomElement(durationOptions)
      const notes = getRandomElement(sampleNotes)

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          parentId: parentId,
          appointmentType,
          scheduledAt,
          durationMinutes,
          status,
          notes: notes || undefined,
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
        },
      })

      const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
      
      createdAppointments.push({
        id: appointment.id,
        patientName,
        appointmentType: appointment.appointmentType,
        scheduledAt: appointment.scheduledAt,
        status: appointment.status,
      })

      console.log(
        `✅ Appointment ${i + 1}/${count} created: ${patientName} - ${appointmentType} on ${scheduledAt.toLocaleDateString()} (${status})`
      )
    }

    console.log("\n" + "=".repeat(70))
    console.log("✅ Sample appointments created successfully!")
    console.log("=".repeat(70))
    console.log(`\nTotal created: ${createdAppointments.length} appointments\n`)

    // Statistics
    const statusCounts = createdAppointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1
      return acc
    }, {} as Record<AppointmentStatus, number>)

    const typeCounts = createdAppointments.reduce((acc, apt) => {
      acc[apt.appointmentType] = (acc[apt.appointmentType] || 0) + 1
      return acc
    }, {} as Record<AppointmentType, number>)

    console.log("Statistics:")
    console.log("-".repeat(70))
    console.log("By Status:")
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })
    console.log("\nBy Type:")
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })

    // Show some sample appointments
    console.log("\n" + "-".repeat(70))
    console.log("Sample appointments (first 10):")
    console.log("-".repeat(70))
    createdAppointments.slice(0, 10).forEach((apt, index) => {
      console.log(
        `${index + 1}. ${apt.patientName} - ${apt.appointmentType}`
      )
      console.log(`   Scheduled: ${apt.scheduledAt.toLocaleString()}`)
      console.log(`   Status: ${apt.status}`)
      console.log("")
    })

    console.log("\nYou can view appointments at: http://localhost:3000/appointments")
  } catch (error) {
    console.error("Error creating sample appointments:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleAppointments()
