"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  totalPatients: number
  totalAppointments: number
  todayAppointments: number
  upcomingAppointments: number
  completedAppointments: number
  cancelledAppointments: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch statistics
      const statsResponse = await fetch("/api/admin/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch today's appointments
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const appointmentsResponse = await fetch("/api/appointments")
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        // Filter appointments for today
        const todayApps = (appointmentsData.appointments || []).filter((apt: any) => {
          const aptDate = new Date(apt.scheduledAt)
          return aptDate >= today && aptDate < tomorrow && apt.status !== "cancelled"
        })
        setTodayAppointments(todayApps)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error: {error}
        <Button onClick={fetchDashboardData} className="ml-4" variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total Patients
          </h3>
          <p className="text-3xl font-bold">{stats?.totalPatients || 0}</p>
          <Button asChild variant="link" className="mt-2 p-0 h-auto">
            <Link href="/admin/patients">View all →</Link>
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total Appointments
          </h3>
          <p className="text-3xl font-bold">{stats?.totalAppointments || 0}</p>
          <Button asChild variant="link" className="mt-2 p-0 h-auto">
            <Link href="/admin/appointments">View all →</Link>
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Today's Appointments
          </h3>
          <p className="text-3xl font-bold">{stats?.todayAppointments || 0}</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Upcoming
          </h3>
          <p className="text-3xl font-bold">
            {stats?.upcomingAppointments || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button asChild className="h-auto py-6">
          <Link href="/admin/appointments/new">
            <div className="text-left">
              <div className="font-semibold">Create Appointment</div>
              <div className="text-sm font-normal opacity-90">
                Schedule a new appointment
              </div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto py-6">
          <Link href="/admin/patients/new">
            <div className="text-left">
              <div className="font-semibold">Add Patient</div>
              <div className="text-sm font-normal opacity-90">
                Create a new patient profile
              </div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-auto py-6">
          <Link href="/admin/settings">
            <div className="text-left">
              <div className="font-semibold">Settings</div>
              <div className="text-sm font-normal opacity-90">
                Configure system settings
              </div>
            </div>
          </Link>
        </Button>
      </div>

      {/* Today's Appointments */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Today's Appointments</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/appointments">View All</Link>
          </Button>
        </div>

        {todayAppointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No appointments scheduled for today
          </p>
        ) : (
          <div className="space-y-3">
            {todayAppointments.slice(0, 5).map((appointment: any) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatTime(appointment.scheduledAt)}
                    </span>
                    <span className="text-muted-foreground">
                      {appointment.patient.user.firstName}{" "}
                      {appointment.patient.user.lastName}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : appointment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {appointment.appointmentType
                      .split("_")
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/appointments/${appointment.id}`}>
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

