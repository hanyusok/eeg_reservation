import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth"

// Validate required environment variables
const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
if (!secret) {
  console.error(
    "⚠️  AUTH_SECRET or NEXTAUTH_SECRET is not set. Authentication will not work properly."
  )
}

// NextAuth v5 configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: secret,
})

