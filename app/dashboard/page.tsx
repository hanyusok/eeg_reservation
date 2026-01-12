import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { UserProfile } from "@/components/dashboard/user-profile"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name || session.user.email}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Role: {session.user.role}
        </p>
      </div>

      {/* User Profile Section */}
      <div className="mb-8">
        <UserProfile session={session} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Appointments</h2>
          <p className="text-muted-foreground mb-4">
            View and manage your appointments
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/appointments">View Appointments</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/appointments/book">Book New</Link>
            </Button>
          </div>
        </div>

        {(session.user.role === "parent" ||
          session.user.role === "admin" ||
          session.user.role === "doctor" ||
          session.user.role === "patient") && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Patients</h2>
            <p className="text-muted-foreground mb-4">
              Manage patient profiles
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/patients">View Patients</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/patients/new">Add Patient</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <p className="text-muted-foreground mb-4">
            Manage your account information
          </p>
          <Button asChild variant="outline">
            <Link href="/profile">Edit Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

