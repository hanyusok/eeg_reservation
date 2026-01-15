import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AdminAppointmentsList from "@/components/admin/admin-appointments-list"
import { getMessages } from "@/lib/i18n"

export default async function AdminAppointmentsPage() {
  const session = await auth()
  const messages = getMessages("en")

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
          <h1 className="text-3xl font-bold">{messages.admin.appointmentsTitle}</h1>
          <p className="text-muted-foreground">
            {messages.admin.appointmentsSubtitle}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/appointments/new">{messages.admin.appointmentsCta}</Link>
        </Button>
      </div>

      <AdminAppointmentsList />
    </div>
  )
}

