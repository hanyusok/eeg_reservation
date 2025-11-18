import { NextResponse } from "next/server"
import { signOut } from "next-auth/react"

export async function POST() {
  return NextResponse.json({ message: "Logged out successfully" })
}

