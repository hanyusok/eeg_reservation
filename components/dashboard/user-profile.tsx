"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { User, Mail, Shield, LogOut, Settings } from "lucide-react"
import { getLocaleFromPathname, withLocalePath } from "@/lib/i18n"
import { useMessages } from "@/lib/i18n-client"

interface UserProfileProps {
  session: {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
    }
  }
}

export function UserProfile({ session }: UserProfileProps) {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const { messages } = useMessages()
  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "doctor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "parent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "patient":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return messages.roles.admin
      case "doctor":
        return messages.roles.doctor
      case "parent":
        return messages.roles.parent
      case "patient":
        return messages.roles.patient
      default:
        return role
    }
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={undefined} alt={session.user.name || "User"} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(session.user.name, session.user.email)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Info Section */}
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="text-2xl font-bold">
              {session.user.name || "User"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  session.user.role
                )}`}
              >
                <Shield className="h-3 w-3 mr-1" />
                {getRoleLabel(session.user.role)}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{session.user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                {messages.userProfile.idLabel} {session.user.id.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" size="sm">
            <Link href={withLocalePath(locale, "/profile")}>
              <Settings className="h-4 w-4 mr-2" />
              {messages.userProfile.editProfile}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {messages.userProfile.signOut}
          </Button>
        </div>
      </div>
    </div>
  )
}
