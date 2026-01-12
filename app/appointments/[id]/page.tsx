import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AppointmentDetail from "@/components/appointments/appointment-detail"

export default async function AppointmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return <AppointmentDetail appointmentId={params.id} />
}
