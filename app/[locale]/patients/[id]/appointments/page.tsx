import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PatientAppointmentsList from "@/components/patients/patient-appointments-list"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getMessages, type Locale, withLocalePath } from "@/lib/i18n"

export default async function LocalizedPatientAppointmentsPage(props: {
  params: Promise<{ id: string; locale: string }>
}) {
  const params = await props.params
  const session = await auth()
  const locale = params.locale as Locale
  const messages = getMessages(locale)

  if (!session) {
    redirect("/auth/login")
  }

  const patientDetailHref = withLocalePath(locale, `/patients/${params.id}`)
  const bookHref = withLocalePath(locale, `/appointments/book?patientId=${params.id}`)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton href={patientDetailHref} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{messages.patientsAppointments.title}</h1>
            <p className="text-muted-foreground">{messages.patientsAppointments.subtitle}</p>
          </div>
          <Button asChild>
            <Link href={bookHref}>{messages.patientsAppointments.cta}</Link>
          </Button>
        </div>
      </div>

      <PatientAppointmentsList patientId={params.id} />
    </div>
  )
}
