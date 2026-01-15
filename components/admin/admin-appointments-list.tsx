"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
        throw new Error("Failed to fetch appointments")
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

  const formatAppointmentType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
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
    return <div className="text-center py-8">Loading appointments...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error: {error}
        <Button onClick={fetchAppointments} className="ml-4" variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Search by patient name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No appointments found
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {formatAppointmentType(appointment.appointmentType)}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>Patient:</strong> {appointment.patient.user.firstName}{" "}
                      {appointment.patient.user.lastName} ({appointment.patient.user.email})
                    </p>
                    <p>
                      <strong>Parent:</strong> {appointment.parent.firstName}{" "}
                      {appointment.parent.lastName} ({appointment.parent.email})
                    </p>
                    <p>
                      <strong>Date & Time:</strong> {formatDate(appointment.scheduledAt)}
                    </p>
                    <p>
                      <strong>Duration:</strong> {appointment.durationMinutes} minutes
                    </p>
                    {appointment.notes && (
                      <p>
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/appointments/${appointment.id}`}>
                      Manage
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredAppointments.length} of {appointments.length} appointments
      </div>
    </div>
  )
}

