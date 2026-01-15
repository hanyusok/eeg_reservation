import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AdminPatientsList from "@/components/admin/admin-patients-list"
import { getMessages } from "@/lib/i18n"

export default async function AdminPatientsPage() {
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
          <h1 className="text-3xl font-bold">{messages.admin.patientsTitle}</h1>
          <p className="text-muted-foreground">
            {messages.admin.patientsSubtitle}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/patients/new">{messages.admin.patientsCta}</Link>
        </Button>
      </div>

      <AdminPatientsList />
    </div>
  )
}

