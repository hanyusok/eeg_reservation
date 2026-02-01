import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PatientDetail from "@/components/patients/patient-detail"
import { BackButton } from "@/components/ui/back-button"
import { getMessages, type Locale, withLocalePath } from "@/lib/i18n"

export default async function LocalizedPatientDetailPage(props: {
  params: Promise<{ id: string; locale: string }>
}) {
  const params = await props.params
  const session = await auth()
  const locale = params.locale as Locale
  const messages = getMessages(locale)

  if (!session) {
    redirect("/auth/login")
  }

  const patientsHref = withLocalePath(locale, "/patients")

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton href={patientsHref} />
        </div>
        <h1 className="text-3xl font-bold">{messages.patientsDetail.title}</h1>
        <p className="text-muted-foreground">{messages.patientsDetail.subtitle}</p>
      </div>

      <PatientDetail patientId={params.id} />
    </div>
  )
}
