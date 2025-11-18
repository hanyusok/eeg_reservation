import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AdminPatientsList from "@/components/admin/admin-patients-list"

export default async function AdminPatientsPage() {
  const session = await auth()

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
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">
            View and manage all patient profiles
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/patients/new">Add New Patient</Link>
        </Button>
      </div>

      <AdminPatientsList />
    </div>
  )
}

