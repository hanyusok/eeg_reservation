import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Appointments</h2>
          <p className="text-muted-foreground mb-4">
            View and manage your appointments
          </p>
          <Button asChild>
            <Link href="/appointments">View Appointments</Link>
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <p className="text-muted-foreground mb-4">
            Manage your account information
          </p>
          <Button asChild variant="outline">
            <Link href="/profile">Edit Profile</Link>
          </Button>
        </div>

        {session.user.role === "parent" && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Patients</h2>
            <p className="text-muted-foreground mb-4">
              Manage patient profiles
            </p>
            <Button asChild variant="outline">
              <Link href="/patients">View Patients</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

