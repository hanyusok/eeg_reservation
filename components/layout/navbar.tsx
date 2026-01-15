"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Calendar, Users, User, LogOut, Settings, Info, Menu, X } from "lucide-react"
import { signOut } from "next-auth/react"
import { getLocaleFromPathname, withLocalePath } from "@/lib/i18n"
import { useMessages } from "@/lib/i18n-client"

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const locale = getLocaleFromPathname(pathname)
  const { messages } = useMessages()

  // Don't show navbar on auth pages or home page
  if (
    status === "loading" ||
    !session ||
    pathname?.startsWith("/auth") ||
    pathname === "/"
  ) {
    return null
  }

  const isActive = (path: string) => {
    const targetPath = withLocalePath(locale, path)
    if (path === "/dashboard") {
      return pathname === targetPath
    }
    return pathname?.startsWith(targetPath)
  }

  const withLocale = (path: string) => withLocalePath(locale, path)

  const userRole = session?.user?.role

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
              <Link href={withLocale("/dashboard")} className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span className="font-bold text-lg hidden sm:inline">
                {messages.nav.brand}
              </span>
              <span className="font-bold text-lg sm:hidden">
                {messages.nav.brandShort}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              asChild
              variant={isActive("/dashboard") ? "default" : "ghost"}
              size="sm"
            >
              <Link href={withLocale("/dashboard")}>
                <Home className="h-4 w-4 mr-2" />
                {messages.nav.dashboard}
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/appointments") ? "default" : "ghost"}
              size="sm"
            >
              <Link href={withLocale("/appointments")}>
                <Calendar className="h-4 w-4 mr-2" />
                {messages.nav.appointments}
              </Link>
            </Button>

            {(userRole === "parent" ||
              userRole === "admin" ||
              userRole === "doctor" ||
              userRole === "patient") && (
              <Button
                asChild
                variant={isActive("/patients") ? "default" : "ghost"}
                size="sm"
              >
                <Link href={withLocale("/patients")}>
                  <Users className="h-4 w-4 mr-2" />
                  {messages.nav.patients}
                </Link>
              </Button>
            )}

            <Button
              asChild
              variant={isActive("/information") ? "default" : "ghost"}
              size="sm"
            >
              <Link href={withLocale("/information")}>
                <Info className="h-4 w-4 mr-2" />
                {messages.nav.information}
              </Link>
            </Button>

            {(userRole === "admin" || userRole === "doctor") && (
              <Button
                asChild
                variant={isActive("/admin") ? "default" : "ghost"}
                size="sm"
              >
                <Link href={withLocale("/admin")}>
                  <Settings className="h-4 w-4 mr-2" />
                  {messages.nav.admin}
                </Link>
              </Button>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              asChild
              variant={isActive("/profile") ? "default" : "ghost"}
              size="sm"
            >
              <Link href={withLocale("/profile")}>
                <User className="h-4 w-4 mr-2" />
                {messages.nav.profile}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {messages.nav.signOut}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <Button
              asChild
              variant={isActive("/dashboard") ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
               <Link href={withLocale("/dashboard")}>
                <Home className="h-4 w-4 mr-2" />
                {messages.nav.dashboard}
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/appointments") ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
               <Link href={withLocale("/appointments")}>
                <Calendar className="h-4 w-4 mr-2" />
                {messages.nav.appointments}
              </Link>
            </Button>

            {(userRole === "parent" ||
              userRole === "admin" ||
              userRole === "doctor" ||
              userRole === "patient") && (
              <Button
                asChild
                variant={isActive("/patients") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                 <Link href={withLocale("/patients")}>
                  <Users className="h-4 w-4 mr-2" />
                  {messages.nav.patients}
                </Link>
              </Button>
            )}

            <Button
              asChild
              variant={isActive("/information") ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
               <Link href={withLocale("/information")}>
                <Info className="h-4 w-4 mr-2" />
                {messages.nav.information}
              </Link>
            </Button>

            {(userRole === "admin" || userRole === "doctor") && (
              <Button
                asChild
                variant={isActive("/admin") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                 <Link href={withLocale("/admin")}>
                  <Settings className="h-4 w-4 mr-2" />
                  {messages.nav.admin}
                </Link>
              </Button>
            )}

            <div className="border-t pt-2 mt-2 space-y-2">
              <Button
                asChild
                variant={isActive("/profile") ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                 <Link href={withLocale("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  {messages.nav.profile}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut({ callbackUrl: "/auth/login" })
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                 {messages.nav.signOut}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
