import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AppointmentsList from "@/components/appointments/appointments-list"

export default async function AppointmentsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            View and manage your appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/appointments/book">Book New Appointment</Link>
        </Button>
      </div>

      <AppointmentsList />
    </div>
  )
}

