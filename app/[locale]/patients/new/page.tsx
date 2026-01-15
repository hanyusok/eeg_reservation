import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PatientForm from "@/components/patients/patient-form"
import { BackButton } from "@/components/ui/back-button"
import { getMessages, type Locale, withLocalePath } from "@/lib/i18n"

export default async function LocalizedNewPatientPage({
  params,
}: {
  params: { locale: string }
}) {
  const session = await auth()
  const locale = params.locale as Locale
  const messages = getMessages(locale)

  if (!session) {
    redirect("/auth/login")
  }

  if (
    session.user.role !== "parent" &&
    session.user.role !== "admin" &&
    session.user.role !== "doctor" &&
    session.user.role !== "patient"
  ) {
    redirect("/dashboard")
  }

  const patientsHref = withLocalePath(locale, "/patients")

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton href={patientsHref} />
        </div>
        <h1 className="text-3xl font-bold">{messages.patientsNew.title}</h1>
        <p className="text-muted-foreground">{messages.patientsNew.subtitle}</p>
      </div>

      <PatientForm redirectTo={patientsHref} />
    </div>
  )
}
