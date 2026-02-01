import { auth } from "@/auth"
import { supportedLocales } from "@/lib/i18n"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    // Redirect to default locale (ko) if no locale is present
    const locale = "ko"
    req.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(req.nextUrl)
  }

  const locale = pathname.startsWith("/ko") ? "ko" : "en"
  const localePrefix = `/${locale}`
  const normalizedPath = pathname.slice(localePrefix.length) || "/"

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
    "/auth/:path*",
    "/(en|ko)/auth/:path*",
  ],
}

