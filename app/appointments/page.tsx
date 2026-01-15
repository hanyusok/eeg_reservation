import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AppointmentsList from "@/components/appointments/appointments-list"
import { getMessages } from "@/lib/i18n"

export default async function AppointmentsPage() {
  const session = await auth()
  const messages = getMessages("en")

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{messages.appointments.title}</h1>
          <p className="text-muted-foreground">
            {messages.appointments.subtitle}
          </p>
        </div>
        <Button asChild>
          <Link href="/appointments/book">{messages.appointments.cta}</Link>
        </Button>
      </div>

      <AppointmentsList />
    </div>
  )
}

