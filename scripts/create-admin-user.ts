/**
 * Script to create an admin user for testing
 * Run with: npx tsx scripts/create-admin-user.ts
 */

// Load environment variables from .env file
import "dotenv/config"

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function createAdminUser() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com"
  const password = process.env.ADMIN_PASSWORD || "admin123"
  const firstName = process.env.ADMIN_FIRST_NAME || "Admin"
  const lastName = process.env.ADMIN_LAST_NAME || "User"

  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log(`User with email ${email} already exists.`)
      console.log(`You can log in with:`)
      console.log(`Email: ${email}`)
      console.log(`Password: ${password}`)
      return
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: "admin",
      },
    })

    console.log("✅ Admin user created successfully!")
    console.log("\nLogin credentials:")
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`\nYou can now log in at: http://localhost:3000/auth/login`)
    console.log(`Admin dashboard: http://localhost:3000/admin`)
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()

