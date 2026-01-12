import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import PatientsList from "@/components/patients/patients-list"

export default async function PatientsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">
            Manage patient profiles
          </p>
        </div>
        {(session.user.role === "parent" ||
          session.user.role === "admin" ||
          session.user.role === "doctor" ||
          session.user.role === "patient") && (
          <Button asChild>
            <Link href="/patients/new">Add New Patient</Link>
          </Button>
        )}
      </div>

      <PatientsList />
    </div>
  )
}

