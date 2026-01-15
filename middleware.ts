import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const session = req.auth
  const path = req.nextUrl.pathname
  const locale = path.startsWith("/ko")
    ? "ko"
    : path.startsWith("/en")
      ? "en"
      : null
  const localePrefix = locale ? `/${locale}` : ""
  const normalizedPath = locale ? path.slice(localePrefix.length) || "/" : path

  // Admin routes
  if (
    normalizedPath.startsWith("/admin") &&
    session?.user?.role !== "admin" &&
    session?.user?.role !== "doctor"
  ) {
    return NextResponse.redirect(new URL(`${localePrefix}/dashboard`, req.url))
  }

  // Doctor routes
  if (
    normalizedPath.startsWith("/doctor") &&
    session?.user?.role !== "doctor" &&
    session?.user?.role !== "admin"
  ) {
    return NextResponse.redirect(new URL(`${localePrefix}/dashboard`, req.url))
  }

  // Patient/Parent routes
  if (
    normalizedPath.startsWith("/dashboard") &&
    session?.user?.role !== "patient" &&
    session?.user?.role !== "parent"
  ) {
    if (session?.user?.role === "admin" || session?.user?.role === "doctor") {
      return NextResponse.redirect(new URL(`${localePrefix}/admin`, req.url))
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
    "/(en|ko)/dashboard/:path*",
    "/(en|ko)/admin/:path*",
    "/(en|ko)/doctor/:path*",
    "/(en|ko)/appointments/:path*",
    "/(en|ko)/patients/:path*",
    "/(en|ko)/profile/:path*",
  ],
}

