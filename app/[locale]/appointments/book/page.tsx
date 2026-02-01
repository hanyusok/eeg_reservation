import { auth } from "@/auth"
import { redirect } from "next/navigation"
import BookingForm from "@/components/appointments/booking-form"
import { BackButton } from "@/components/ui/back-button"
import { getMessages, type Locale, withLocalePath } from "@/lib/i18n"

export default async function LocalizedBookAppointmentPage(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params
  const session = await auth()
  const locale = params.locale as Locale
  const messages = getMessages(locale)

  if (!session) {
    redirect("/auth/login")
  }

  const appointmentsHref = withLocalePath(locale, "/appointments")
  const createPatientHref = withLocalePath(locale, "/patients/new")

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton href={appointmentsHref} />
        </div>
        <h1 className="text-3xl font-bold">{messages.appointmentsBook.title}</h1>
        <p className="text-muted-foreground">
          {messages.appointmentsBook.subtitle}
        </p>
      </div>

      <BookingForm redirectTo={appointmentsHref} createPatientHref={createPatientHref} />
    </div>
  )
}
