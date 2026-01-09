import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Custom Kakao provider for NextAuth v5
// Note: This is a simplified implementation. You may need to adjust based on actual Kakao API responses
function Kakao(options: { clientId: string; clientSecret?: string }) {
  // Validate clientId to prevent "invalid_client" errors
  if (!options.clientId || options.clientId.trim() === "") {
    throw new Error(
      "Kakao clientId is required. Please set KAKAO_CLIENT_ID in your .env file."
    )
  }

  const clientId = options.clientId.trim()
  const clientSecret = (options.clientSecret || "").trim()

  return {
    id: "kakao",
    name: "Kakao",
    type: "oauth" as const,
    authorization: {
      url: "https://kauth.kakao.com/oauth/authorize",
      params: {
        // Only request profile_nickname initially
        // account_email will be requested if available (optional)
        // If you need email, enable it in Kakao Developer Console → 카카오 로그인 → 동의항목
        scope: "profile_nickname",
        response_type: "code",
      },
    },
    token: "https://kauth.kakao.com/oauth/token",
    userinfo: "https://kapi.kakao.com/v2/user/me",
    clientId: clientId,
    clientSecret: clientSecret,
    profile(profile: any) {
      // Kakao API v2 response structure:
      // {
      //   id: 123456789,
      //   kakao_account: {
      //     email: "user@example.com",
      //     profile: {
      //       nickname: "홍길동",
      //       profile_image_url: "https://..."
      //     }
      //   }
      // }
      const kakaoAccount = profile.kakao_account || {}
      const kakaoProfile = kakaoAccount.profile || {}
      
      // Map Kakao profile to NextAuth user format
      // Note: email may be null if account_email consent is not granted
      const kakaoId = profile.id?.toString() || String(kakaoAccount.id || "")
      const email = kakaoAccount.email || `${kakaoId}@kakao.com`
      
      const mappedProfile = {
        id: kakaoId,
        email: email,
        name: kakaoProfile.nickname || "Kakao User",
        image: kakaoProfile.profile_image_url,
      }
      
      // Warn if email is not available (fallback email used)
      if (!kakaoAccount.email && process.env.NODE_ENV === "development") {
        console.warn("[Kakao] Email not available. Enable 'account_email' consent item in Kakao Developer Console.")
      }
      
      // Debug logging (remove in production)
      if (process.env.NODE_ENV === "development") {
        console.log("[Kakao Profile Mapping]", {
          original: {
            id: profile.id,
            email: kakaoAccount.email,
            nickname: kakaoProfile.nickname,
          },
          mapped: mappedProfile,
        })
      }
      
      return mappedProfile
    },
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`,
        }
      },
    }),
    // Google OAuth provider - only add if both clientId and clientSecret are properly set
    ...(process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID.trim() !== "" &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET.trim() !== ""
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID.trim(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
          }),
        ]
      : []),
    // Kakao OAuth provider - only add if clientId is properly set
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_ID.trim() !== ""
      ? [
          Kakao({
            clientId: process.env.KAKAO_CLIENT_ID.trim(),
            clientSecret: process.env.KAKAO_CLIENT_SECRET?.trim() || "",
          }) as any,
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "kakao") {
        try {
          // Debug logging
          if (process.env.NODE_ENV === "development") {
            console.log("[OAuth SignIn]", {
              provider: account.provider,
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
              },
            })
          }

          // Check if user exists
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!dbUser) {
            // Create new user from OAuth
            // Handle name parsing for both English and Korean names
            let firstName = "User"
            let lastName = ""

            if (user.name) {
              // For Korean names (no space), use full name as firstName
              // For English names (with space), split by space
              if (account.provider === "kakao") {
                // Kakao typically provides Korean names without spaces
                // Use full name as firstName, empty lastName
                firstName = user.name
                lastName = ""
              } else {
                // Google and other providers may have spaces
                const nameParts = user.name.split(" ")
                firstName = nameParts[0] || "User"
                lastName = nameParts.slice(1).join(" ") || ""
              }
            }

            // Generate a random password hash for OAuth users
            // They won't be able to use password login, only OAuth
            const tempPassword = `oauth_${Math.random().toString(36).slice(2)}`
            const passwordHash = await bcrypt.hash(tempPassword, 10)

            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                passwordHash,
                firstName,
                lastName,
                role: "patient", // Default role for OAuth users
              },
            })

            // Create audit log
            await prisma.auditLog.create({
              data: {
                userId: dbUser.id,
                action: "user_registered_oauth",
                entityType: "user",
                entityId: dbUser.id,
                details: {
                  email: dbUser.email,
                  role: dbUser.role,
                  provider: account.provider,
                  oauthName: user.name,
                },
              },
            })

            if (process.env.NODE_ENV === "development") {
              console.log("[OAuth User Created]", {
                id: dbUser.id,
                email: dbUser.email,
                name: `${dbUser.firstName} ${dbUser.lastName}`,
                role: dbUser.role,
              })
            }
          }

          // Update user object with database user info for JWT token
          // This ensures session has the correct user.id and role
          user.id = dbUser.id
          ;(user as any).role = dbUser.role
          
          if (process.env.NODE_ENV === "development") {
            console.log("[OAuth SignIn Complete]", {
              userId: user.id,
              email: user.email,
              role: (user as any).role,
            })
          }

          return true
        } catch (error) {
          console.error("Error in OAuth sign in:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Map user data to JWT token
      // This is called when:
      // 1. User signs in (user object available)
      // 2. Token is accessed (user object is null, use existing token)
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        ;(token as any).email = user.email
        
        if (process.env.NODE_ENV === "development") {
          console.log("[JWT Token Created]", {
            id: token.id,
            email: (token as any).email,
            role: token.role,
            provider: account?.provider,
          })
        }
      }
      return token
    },
    async session({ session, token }) {
      // Map JWT token data to session object
      // This is called every time session is accessed
      if (session.user) {
        // Map token fields to session.user
        // Session structure (from types/next-auth.d.ts):
        // {
        //   user: {
        //     id: string
        //     email: string
        //     role: string
        //     name?: string | null
        //   }
        // }
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as string
        
        if (process.env.NODE_ENV === "development") {
          console.log("[Session Mapped]", {
            userId: session.user.id,
            email: session.user.email,
            role: (session.user as any).role,
            name: session.user.name,
          })
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig

