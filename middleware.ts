import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const session = req.auth
  const path = req.nextUrl.pathname

  // Admin routes
  if (path.startsWith("/admin") && session?.user?.role !== "admin" && session?.user?.role !== "doctor") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Doctor routes
  if (path.startsWith("/doctor") && session?.user?.role !== "doctor" && session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Patient/Parent routes
  if (path.startsWith("/dashboard") && session?.user?.role !== "patient" && session?.user?.role !== "parent") {
    if (session?.user?.role === "admin" || session?.user?.role === "doctor") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/doctor/:path*",
    "/appointments/:path*",
    "/patients/:path*",
  ],
}

