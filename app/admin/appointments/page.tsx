import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AdminAppointmentsList from "@/components/admin/admin-appointments-list"

export default async function AdminAppointmentsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role !== "admin" && session.user.role !== "doctor") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointment Management</h1>
          <p className="text-muted-foreground">
            View and manage all appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/appointments/new">Create Appointment</Link>
        </Button>
      </div>

      <AdminAppointmentsList />
    </div>
  )
}

