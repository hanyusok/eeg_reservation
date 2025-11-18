import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AppointmentDetail from "@/components/admin/appointment-detail"

export default async function AdminAppointmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role !== "admin" && session.user.role !== "doctor") {
    redirect("/dashboard")
  }

  return <AppointmentDetail appointmentId={params.id} />
}

