import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AppointmentDetail from "@/components/admin/appointment-detail"

export default async function LocalizedAdminAppointmentDetailPage(props: {
  params: Promise<{ id: string; locale: string }>
}) {
  const params = await props.params
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role !== "admin" && session.user.role !== "doctor") {
    redirect("/dashboard")
  }

  return <AppointmentDetail appointmentId={params.id} />
}
