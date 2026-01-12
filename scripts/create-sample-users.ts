/**
 * Script to create 10 random sample users for testing
 * Run with: npx tsx scripts/create-sample-users.ts
 */

// Load environment variables from .env file
import "dotenv/config"

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// Sample data for random generation
const firstNames = [
  "김", "이", "박", "최", "정", "강", "조", "윤", "장", "임",
  "한", "오", "서", "신", "권", "황", "안", "송", "전", "홍",
  "John", "Jane", "Michael", "Sarah", "David", "Emily", "James", "Emma",
  "Robert", "Olivia", "William", "Sophia", "Richard", "Isabella"
]

const lastNames = [
  "민준", "서준", "도윤", "예준", "시우", "하준", "주원", "지호",
  "준서", "건우", "서연", "서윤", "지우", "서현", "민서", "하은",
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson"
]

const roles: ("patient" | "parent" | "admin" | "doctor")[] = [
  "patient",
  "parent",
  "admin",
  "doctor",
]

const domains = ["example.com", "test.com", "demo.com", "sample.org"]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateRandomPhone(): string {
  const areaCode = Math.floor(Math.random() * 9000) + 1000
  const middle = Math.floor(Math.random() * 9000) + 1000
  const last = Math.floor(Math.random() * 10000)
  return `010-${areaCode}-${last.toString().padStart(4, "0")}`
}

function generateRandomEmail(firstName: string, lastName: string, index: number): string {
  const domain = getRandomElement(domains)
  const randomNum = Math.floor(Math.random() * 1000)
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}${randomNum}@${domain}`
}

async function createSampleUsers() {
  const count = parseInt(process.env.USER_COUNT || "10")
  const defaultPassword = process.env.DEFAULT_PASSWORD || "password123"

  console.log(`Creating ${count} random sample users...\n`)

  const createdUsers: Array<{
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
    phone?: string
  }> = []

  try {
    // Hash password once (all users will have the same password for testing)
    const passwordHash = await bcrypt.hash(defaultPassword, 10)

    for (let i = 0; i < count; i++) {
      const firstName = getRandomElement(firstNames)
      const lastName = getRandomElement(lastNames)
      const role = getRandomElement(roles)
      const email = generateRandomEmail(firstName, lastName, i)
      const phone = Math.random() > 0.3 ? generateRandomPhone() : undefined

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        console.log(`⚠️  User ${i + 1}: ${email} already exists, skipping...`)
        continue
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role,
          phone,
        },
      })

      createdUsers.push({
        email: user.email,
        password: defaultPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone || undefined,
      })

      console.log(`✅ User ${i + 1}/${count} created: ${email} (${role})`)
    }

    console.log("\n" + "=".repeat(60))
    console.log("✅ Sample users created successfully!")
    console.log("=".repeat(60))
    console.log(`\nTotal created: ${createdUsers.length} users`)
    console.log(`Default password for all users: ${defaultPassword}\n`)

    console.log("Created users:")
    console.log("-".repeat(60))
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Phone: ${user.phone || "N/A"}`)
      console.log(`   Password: ${user.password}`)
      console.log("")
    })

    console.log("\nYou can now log in at: http://localhost:3000/auth/login")
  } catch (error) {
    console.error("Error creating sample users:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleUsers()
