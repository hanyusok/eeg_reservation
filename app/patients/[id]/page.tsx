import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PatientDetail from "@/components/patients/patient-detail"
import { BackButton } from "@/components/ui/back-button"

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton href="/patients" />
        </div>
        <h1 className="text-3xl font-bold">Patient Details</h1>
        <p className="text-muted-foreground">
          View and manage patient information
        </p>
      </div>

      <PatientDetail patientId={params.id} />
    </div>
  )
}
