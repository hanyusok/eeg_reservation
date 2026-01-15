"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, RefreshCw, AlertCircle } from "lucide-react"
import { getLocaleFromPathname, withLocalePath } from "@/lib/i18n"
import { useMessages } from "@/lib/i18n-client"

interface Appointment {
  id: string
  appointmentType: string
  scheduledAt: string
  durationMinutes: number
  status: string
  notes: string | null
  parent: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

interface PatientAppointmentsListProps {
  patientId: string
}

export default function PatientAppointmentsList({
  patientId,
}: PatientAppointmentsListProps) {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const { messages } = useMessages()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [patientId])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/patients/${patientId}/appointments`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(messages.patientAppointments.errors.patientNotFound)
        }
        if (response.status === 403) {
          throw new Error(messages.patientAppointments.errors.forbidden)
        }
        throw new Error(messages.patientAppointments.errors.fetchFailed)
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
    switch (status.toLowerCase()) {
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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">
          {messages.patientAppointments.loading}
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <div className="flex items-center gap-2 text-destructive mb-4">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">{messages.common.errorTitle}</h3>
        </div>
        <p className="text-sm mb-4">{error}</p>
        <Button onClick={fetchAppointments} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {messages.common.retry}
        </Button>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          {messages.patientAppointments.empty}
        </p>
        <Button asChild>
          <Link
            href={withLocalePath(locale, `/appointments/book?patientId=${patientId}`)}
          >
            {messages.patientAppointments.book}
          </Link>
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
                <Calendar className="h-4 w-4" />
                <p className="font-medium">{formatDate(appointment.scheduledAt)}</p>
              </div>
              <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <p>
                  {messages.patientAppointments.durationLabel}{" "}
                  {appointment.durationMinutes} {messages.patientAppointments.minutes}
                </p>
              </div>
              {appointment.parent && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>
                    {messages.patientAppointments.parentLabel}{" "}
                    {appointment.parent.firstName} {appointment.parent.lastName}
                  </p>
                </div>
              )}
              {appointment.notes && (
                <p className="mt-3 text-sm bg-muted/50 p-3 rounded-md">
                  {appointment.notes}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={withLocalePath(locale, `/appointments/${appointment.id}`)}>
                  {messages.patientAppointments.viewDetails}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
