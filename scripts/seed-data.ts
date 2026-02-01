
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// Korean Names
const FIRST_NAMES = ["민준", "서준", "도윤", "예준", "시우", "하준", "지호", "지후", "준우", "준서", "서연", "서윤", "지우", "서현", "하은", "하윤", "민서", "지유", "윤서", "채원"]
const LAST_NAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "전"]

// English Names (kept for variety if needed, but primary focus is Korean as requested)
const EN_FIRST = ["James", "Minjun", "Seojun", "John", "Sarah"]

const APPOINTMENT_TYPES = ["initial_consultation", "eeg_monitoring", "follow_up"]
const APPOINTMENT_STATUSES = ["scheduled", "completed", "cancelled", "rescheduled"]

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
    console.log("Start seeding Korean data...")

    // Create 30 Users (Parents)
    const parents = []
    for (let i = 0; i < 30; i++) {
        const firstName = getRandomElement(FIRST_NAMES)
        const lastName = getRandomElement(LAST_NAMES)
        // Email: romanized-ish random to keep it simple but distinct
        const email = `user.ko.${getRandomInt(10000, 99999)}@example.com`

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            parents.push(existing)
            continue
        }

        const hashedPassword = await bcrypt.hash("password123", 10)

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                firstName: firstName,
                lastName: lastName,
                role: "parent",
                phone: `010-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}`,
            },
        })
        parents.push(user)
        console.log(`Created parent: ${lastName}${firstName} (${user.email})`)
    }

    // Create Patients for these parents (1 per parent for simplicity)
    const patients = []
    for (const parent of parents) {
        const pLastName = parent.lastName
        const pFirstName = getRandomElement(FIRST_NAMES) // Patient Name

        // Create a User account for the patient
        const patientEmail = `patient.${parent.email.split('@')[0]}@example.com`
        let patientUser = await prisma.user.findUnique({ where: { email: patientEmail } })

        if (!patientUser) {
            const hashedPassword = await bcrypt.hash("password123", 10)
            patientUser = await prisma.user.create({
                data: {
                    email: patientEmail,
                    passwordHash: hashedPassword,
                    firstName: pFirstName,
                    lastName: pLastName,
                    role: "patient",
                }
            })
        }

        // Create Patient Profile
        let patientProfile = await prisma.patient.findUnique({ where: { userId: patientUser.id } })

        if (!patientProfile) {
            patientProfile = await prisma.patient.create({
                data: {
                    userId: patientUser.id,
                    parentId: parent.id,
                    dateOfBirth: new Date(2015, getRandomInt(0, 11), getRandomInt(1, 28)), // Child DOB
                    emergencyContactName: `${parent.lastName}${parent.firstName}`, // Korean Format
                    emergencyContactPhone: parent.phone || "010-0000-0000",
                }
            })
        }
        patients.push(patientProfile)
        console.log(`Created patient profile: ${pLastName}${pFirstName}`)
    }

    // Create 50 Appointments
    for (let i = 0; i < 50; i++) {
        const patient = getRandomElement(patients)
        if (!patient.parentId) continue

        const type = getRandomElement(APPOINTMENT_TYPES) as any
        const status = getRandomElement(APPOINTMENT_STATUSES) as any

        const dateOffset = getRandomInt(-30, 30)
        const scheduledAt = new Date()
        scheduledAt.setDate(scheduledAt.getDate() + dateOffset)
        scheduledAt.setHours(getRandomInt(9, 17), 0, 0, 0)

        await prisma.appointment.create({
            data: {
                patientId: patient.id,
                parentId: patient.parentId,
                appointmentType: type,
                status: status,
                scheduledAt: scheduledAt,
                durationMinutes: 60,
                notes: `예약 메모 테스트 ${i + 1}`, // Korean Note
            },
        })
        console.log(`Created appointment ${i + 1}`)
    }

    console.log("Seeding finished.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
