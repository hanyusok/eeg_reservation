"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Calendar, Users, User, LogOut, Settings, Info, Menu, X } from "lucide-react"
import { signOut } from "next-auth/react"

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    if (path === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname?.startsWith(path)
  }

  const userRole = session?.user?.role

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span className="font-bold text-lg hidden sm:inline">EEG Reservation</span>
              <span className="font-bold text-lg sm:hidden">EEG</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              asChild
              variant={isActive("/dashboard") ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/appointments") ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
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
                <Link href="/patients">
                  <Users className="h-4 w-4 mr-2" />
                  Patients
                </Link>
              </Button>
            )}

            <Button
              asChild
              variant={isActive("/information") ? "default" : "ghost"}
              size="sm"
            >
              <Link href="/information">
                <Info className="h-4 w-4 mr-2" />
                Information
              </Link>
            </Button>

            {(userRole === "admin" || userRole === "doctor") && (
              <Button
                asChild
                variant={isActive("/admin") ? "default" : "ghost"}
                size="sm"
              >
                <Link href="/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
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
              <Link href="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
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
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/appointments") ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
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
                <Link href="/patients">
                  <Users className="h-4 w-4 mr-2" />
                  Patients
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
              <Link href="/information">
                <Info className="h-4 w-4 mr-2" />
                Information
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
                <Link href="/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
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
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
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
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
