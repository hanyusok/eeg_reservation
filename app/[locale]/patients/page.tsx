import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import PatientsList from "@/components/patients/patients-list"
import { getMessages, type Locale, withLocalePath } from "@/lib/i18n"

export default async function LocalizedPatientsPage({
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

  const newPatientHref = withLocalePath(locale, "/patients/new")

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{messages.patients.title}</h1>
          <p className="text-muted-foreground">{messages.patients.subtitle}</p>
        </div>
        {(session.user.role === "parent" ||
          session.user.role === "admin" ||
          session.user.role === "doctor" ||
          session.user.role === "patient") && (
          <Button asChild>
            <Link href={newPatientHref}>{messages.patients.cta}</Link>
          </Button>
        )}
      </div>

      <PatientsList />
    </div>
  )
}
