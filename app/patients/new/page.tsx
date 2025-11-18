import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PatientForm from "@/components/patients/patient-form"

export default async function NewPatientPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role !== "parent" && session.user.role !== "admin" && session.user.role !== "doctor") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Patient</h1>
        <p className="text-muted-foreground">
          Create a new patient profile
        </p>
      </div>

      <PatientForm />
    </div>
  )
}

