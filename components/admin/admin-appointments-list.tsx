"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
      email: string
    }
  }
  parent: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function AdminAppointmentsList() {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const { messages } = useMessages()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchAppointments()
  }, [statusFilter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const url =
        statusFilter !== "all"
          ? `/api/appointments?status=${statusFilter}`
          : "/api/appointments"
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(messages.adminAppointmentsList.errors.fetchFailed)
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

  const filteredAppointments = appointments.filter((appointment) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      appointment.patient.user.firstName.toLowerCase().includes(searchLower) ||
      appointment.patient.user.lastName.toLowerCase().includes(searchLower) ||
      appointment.patient.user.email.toLowerCase().includes(searchLower) ||
      appointment.parent.email.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="text-center py-8">
        {messages.adminAppointmentsList.loading}
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder={messages.adminAppointmentsList.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">{messages.adminAppointmentsList.filters.all}</option>
          <option value="scheduled">{messages.status.scheduled}</option>
          <option value="completed">{messages.status.completed}</option>
          <option value="cancelled">{messages.status.cancelled}</option>
          <option value="rescheduled">{messages.status.rescheduled}</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {messages.adminAppointmentsList.empty}
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
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
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>{messages.adminAppointmentsList.labels.patient}</strong>{" "}
                      {appointment.patient.user.firstName}{" "}
                      {appointment.patient.user.lastName} ({appointment.patient.user.email})
                    </p>
                    <p>
                      <strong>{messages.adminAppointmentsList.labels.parent}</strong>{" "}
                      {appointment.parent.firstName} {appointment.parent.lastName} (
                      {appointment.parent.email})
                    </p>
                    <p>
                      <strong>{messages.adminAppointmentsList.labels.dateTime}</strong>{" "}
                      {formatDate(appointment.scheduledAt)}
                    </p>
                    <p>
                      <strong>{messages.adminAppointmentsList.labels.duration}</strong>{" "}
                      {appointment.durationMinutes} {messages.adminAppointmentsList.minutes}
                    </p>
                    {appointment.notes && (
                      <p>
                        <strong>{messages.adminAppointmentsList.labels.notes}</strong>{" "}
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={withLocalePath(locale, `/admin/appointments/${appointment.id}`)}>
                      {messages.adminAppointmentsList.manage}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        {messages.adminAppointmentsList.showing
          .replace("{{filtered}}", String(filteredAppointments.length))
          .replace("{{total}}", String(appointments.length))}
      </div>
    </div>
  )
}

