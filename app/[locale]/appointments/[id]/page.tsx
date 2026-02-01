import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AppointmentDetail from "@/components/appointments/appointment-detail"

export default async function LocalizedAppointmentDetailPage(props: {
  params: Promise<{ id: string; locale: string }>
}) {
  const params = await props.params
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return <AppointmentDetail appointmentId={params.id} />
}
