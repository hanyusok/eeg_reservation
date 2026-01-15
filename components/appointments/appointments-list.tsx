"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { getLocaleFromPathname, withLocalePath } from "@/lib/i18n"
import { useMessages } from "@/lib/i18n-client"

interface Appointment {
  id: string
  appointmentType: string
  scheduledAt: string
  durationMinutes: number
  status: string
  notes: string | null
  patient: {
    user: {
      firstName: string
      lastName: string
    }
  }
}

export default function AppointmentsList() {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const { messages } = useMessages()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/appointments")
      if (!response.ok) {
        throw new Error(messages.appointmentsList.errors.fetchFailed)
      }
      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case "initial_consultation":
        return messages.appointmentType.initialConsultation
      case "eeg_monitoring":
        return messages.appointmentType.eegMonitoring
      case "follow_up":
        return messages.appointmentType.followUp
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        {messages.appointmentsList.loading}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {messages.common.errorPrefix} {error}
        <Button onClick={fetchAppointments} className="ml-4" variant="outline">
          {messages.common.retry}
        </Button>
      </div>
    )
  }

  if (appointments.length === 0) {
    const bookHref = withLocalePath(locale, "/appointments/book")
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          {messages.appointmentsList.empty}
        </p>
        <Button asChild>
          <Link href={bookHref}>{messages.appointmentsList.cta}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">
                  {getAppointmentTypeLabel(appointment.appointmentType)}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {messages.status[appointment.status as keyof typeof messages.status] ||
                    appointment.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <p className="font-medium">
                  {appointment.patient.user.firstName}{" "}
                  {appointment.patient.user.lastName}
                </p>
              </div>
              <p className="text-muted-foreground mb-2">
                {formatDate(appointment.scheduledAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                {messages.appointmentsList.durationLabel} {appointment.durationMinutes}{" "}
                {messages.appointmentsList.minutes}
              </p>
              {appointment.notes && (
                <p className="mt-2 text-sm">{appointment.notes}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={withLocalePath(locale, `/appointments/${appointment.id}`)}>
                  {messages.appointmentsList.viewDetails}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

