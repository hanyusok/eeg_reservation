import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { UserProfile } from "@/components/dashboard/user-profile"
import { prisma } from "@/lib/prisma"
import { getMessages } from "@/lib/i18n"

export default async function DashboardPage() {
  const session = await auth()
  const messages = getMessages("en")

  if (!session) {
    redirect("/auth/login")
  }

  // Fetch fresh user data from database to ensure UI reflects latest changes
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
    },
  })

  if (!userData) {
    redirect("/auth/login")
  }

  // Create updated session object with fresh data from database
  const updatedSession = {
    ...session,
    user: {
      ...session.user,
      name: `${userData.firstName} ${userData.lastName}`.trim() || session.user.email,
      email: userData.email,
      role: userData.role,
    },
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{messages.dashboard.title}</h1>
        <p className="text-muted-foreground">
          {messages.dashboard.welcomePrefix}{" "}
          {updatedSession.user.name || updatedSession.user.email}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {messages.dashboard.roleLabel}: {updatedSession.user.role}
        </p>
      </div>

      {/* User Profile Section */}
      <div className="mb-8">
        <UserProfile session={updatedSession} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">
            {messages.dashboard.appointments.title}
          </h2>
          <p className="text-muted-foreground mb-4">
            {messages.dashboard.appointments.description}
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/appointments">{messages.dashboard.appointments.view}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/appointments/book">{messages.dashboard.appointments.book}</Link>
            </Button>
          </div>
        </div>

        {(session.user.role === "parent" ||
          session.user.role === "admin" ||
          session.user.role === "doctor" ||
          session.user.role === "patient") && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">
              {messages.dashboard.patients.title}
            </h2>
            <p className="text-muted-foreground mb-4">
              {messages.dashboard.patients.description}
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/patients">{messages.dashboard.patients.view}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/patients/new">{messages.dashboard.patients.add}</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">
            {messages.dashboard.profile.title}
          </h2>
          <p className="text-muted-foreground mb-4">
            {messages.dashboard.profile.description}
          </p>
          <Button asChild variant="outline">
            <Link href="/profile">{messages.dashboard.profile.edit}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

