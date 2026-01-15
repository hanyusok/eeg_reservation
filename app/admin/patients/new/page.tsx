import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PatientForm from "@/components/patients/patient-form"
import { BackButton } from "@/components/ui/back-button"
import { getMessages } from "@/lib/i18n"

export default async function AdminNewPatientPage() {
  const session = await auth()
  const messages = getMessages("en")

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role !== "admin" && session.user.role !== "doctor") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton href="/admin/patients" />
        </div>
        <h1 className="text-3xl font-bold">{messages.patientsNew.title}</h1>
        <p className="text-muted-foreground">
          {messages.patientsNew.subtitle}
        </p>
      </div>

      <PatientForm redirectTo="/admin/patients" />
    </div>
  )
}
