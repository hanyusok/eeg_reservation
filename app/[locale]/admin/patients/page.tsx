import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AdminPatientsList from "@/components/admin/admin-patients-list"
import { getMessages, type Locale, withLocalePath } from "@/lib/i18n"

export default async function LocalizedAdminPatientsPage({
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

  if (session.user.role !== "admin" && session.user.role !== "doctor") {
    redirect("/dashboard")
  }

  const newPatientHref = withLocalePath(locale, "/admin/patients/new")

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{messages.admin.patientsTitle}</h1>
          <p className="text-muted-foreground">{messages.admin.patientsSubtitle}</p>
        </div>
        <Button asChild>
          <Link href={newPatientHref}>{messages.admin.patientsCta}</Link>
        </Button>
      </div>

      <AdminPatientsList />
    </div>
  )
}
