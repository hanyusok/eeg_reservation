"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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

  const formatAppointmentType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

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

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No appointments found.</p>
        <Button asChild>
          <Link href="/appointments/book">Book Your First Appointment</Link>
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
              <p className="text-muted-foreground mb-2">
                {formatDate(appointment.scheduledAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                Duration: {appointment.durationMinutes} minutes
              </p>
              {appointment.notes && (
                <p className="mt-2 text-sm">{appointment.notes}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/appointments/${appointment.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

