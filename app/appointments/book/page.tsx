import { auth } from "@/auth"
import { redirect } from "next/navigation"
import BookingForm from "@/components/appointments/booking-form"

export default async function BookAppointmentPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Book Appointment</h1>
        <p className="text-muted-foreground">
          Schedule a new EEG monitoring appointment
        </p>
      </div>

      <BookingForm />
    </div>
  )
}

