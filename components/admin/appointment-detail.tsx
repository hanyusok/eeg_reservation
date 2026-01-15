"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AppointmentNotes from "@/components/admin/appointment-notes"
import DocumentList from "@/components/admin/document-list"
import { getLocaleFromPathname, withLocalePath } from "@/lib/i18n"
import { useMessages } from "@/lib/i18n-client"

interface Appointment {
  id: string
  appointmentType: string
  scheduledAt: string
  durationMinutes: number
  status: string
  notes: string | null
  calendlyEventId: string | null
  patient: {
    id: string
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
  documents: Array<{
    id: string
    fileName: string
    fileType: string
    uploadedAt: string
  }>
}

export default function AppointmentDetail({ appointmentId }: { appointmentId: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const { messages } = useMessages()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [actionLoading, setActionLoading] = useState<null | "complete" | "cancel">(null)
  const [editData, setEditData] = useState({
    status: "",
    notes: "",
    scheduledAt: "",
  })

  useEffect(() => {
    fetchAppointment()
  }, [appointmentId])

  const fetchAppointment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/appointments/${appointmentId}`)
      if (!response.ok) {
        throw new Error(messages.adminAppointmentDetail.errors.fetchFailed)
      }
      const data = await response.json()
      setAppointment(data.appointment)
      setEditData({
        status: data.appointment.status,
        notes: data.appointment.notes || "",
        scheduledAt: new Date(data.appointment.scheduledAt)
          .toISOString()
          .slice(0, 16),
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: editData.status,
          notes: editData.notes,
          scheduledAt: new Date(editData.scheduledAt).toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(messages.adminAppointmentDetail.errors.updateFailed)
      }

      setIsEditing(false)
      fetchAppointment()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleMarkCompleted = async () => {
    if (!appointment || appointment.status === "completed" || appointment.status === "cancelled") {
      return
    }

    try {
      setActionLoading("complete")
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      })

      if (!response.ok) {
        throw new Error(messages.adminAppointmentDetail.errors.completeFailed)
      }

      setIsEditing(false)
      fetchAppointment()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelAppointment = async () => {
    if (!appointment || appointment.status === "cancelled") {
      return
    }

    if (!window.confirm(messages.adminAppointmentDetail.confirmCancel)) {
      return
    }

    try {
      setActionLoading("cancel")
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(messages.adminAppointmentDetail.errors.cancelFailed)
      }

      setIsEditing(false)
      fetchAppointment()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  if (loading) {
    return (
      <div className="text-center py-8">
        {messages.adminAppointmentDetail.loading}
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="text-center py-8 text-destructive">
        {messages.common.errorPrefix} {error || messages.adminAppointmentDetail.notFound}
        <Button onClick={fetchAppointment} className="ml-4" variant="outline">
          {messages.common.retry}
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {messages.adminAppointmentDetail.title}
          </h1>
          <p className="text-muted-foreground">
            {formatAppointmentType(appointment.appointmentType)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={withLocalePath(locale, "/admin/appointments")}>
              {messages.adminAppointmentDetail.backToList}
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleMarkCompleted}
            disabled={
              isEditing ||
              actionLoading === "complete" ||
              appointment.status === "completed" ||
              appointment.status === "cancelled"
            }
          >
            {actionLoading === "complete"
              ? messages.adminAppointmentDetail.actions.marking
              : messages.adminAppointmentDetail.actions.markCompleted}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelAppointment}
            disabled={
              isEditing ||
              actionLoading === "cancel" ||
              appointment.status === "cancelled"
            }
          >
            {actionLoading === "cancel"
              ? messages.adminAppointmentDetail.actions.cancelling
              : messages.adminAppointmentDetail.actions.cancel}
          </Button>
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            {isEditing ? messages.common.cancel : messages.common.edit}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointment Information */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">
            {messages.adminAppointmentDetail.sections.info}
          </h2>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">
                  {messages.adminAppointmentDetail.labels.status}
                </Label>
                <select
                  id="status"
                  value={editData.status}
                  onChange={(e) =>
                    setEditData({ ...editData, status: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="scheduled">{messages.status.scheduled}</option>
                  <option value="completed">{messages.status.completed}</option>
                  <option value="cancelled">{messages.status.cancelled}</option>
                  <option value="rescheduled">{messages.status.rescheduled}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="scheduledAt">
                  {messages.adminAppointmentDetail.labels.scheduledAt}
                </Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={editData.scheduledAt}
                  onChange={(e) =>
                    setEditData({ ...editData, scheduledAt: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="notes">
                  {messages.adminAppointmentDetail.labels.notes}
                </Label>
                <textarea
                  id="notes"
                  value={editData.notes}
                  onChange={(e) =>
                    setEditData({ ...editData, notes: e.target.value })
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button onClick={handleUpdate}>
                {messages.adminAppointmentDetail.actions.saveChanges}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {messages.adminAppointmentDetail.labels.status}
                </p>
                <p className="font-medium">
                  {messages.status[appointment.status as keyof typeof messages.status] ||
                    appointment.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {messages.adminAppointmentDetail.labels.scheduledAt}
                </p>
                <p className="font-medium">{formatDate(appointment.scheduledAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {messages.adminAppointmentDetail.labels.duration}
                </p>
                <p className="font-medium">
                  {appointment.durationMinutes} {messages.adminAppointmentDetail.minutes}
                </p>
              </div>
              {appointment.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {messages.adminAppointmentDetail.labels.notes}
                  </p>
                  <p className="font-medium">{appointment.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Patient Information */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">
            {messages.adminAppointmentDetail.sections.patient}
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {messages.adminAppointmentDetail.labels.patientName}
              </p>
              <p className="font-medium">
                {appointment.patient.user.firstName}{" "}
                {appointment.patient.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {messages.adminAppointmentDetail.labels.email}
              </p>
              <p className="font-medium">{appointment.patient.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {messages.adminAppointmentDetail.labels.parent}
              </p>
              <p className="font-medium">
                {appointment.parent.firstName} {appointment.parent.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {appointment.parent.email}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link
                href={withLocalePath(locale, `/admin/patients/${appointment.patient.id}`)}
              >
                {messages.adminAppointmentDetail.actions.viewPatient}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Appointment Notes */}
      <div className="mt-6">
        <AppointmentNotes appointmentId={appointmentId} />
      </div>

      {/* Documents */}
      <div className="mt-6">
        <DocumentList
          patientId={appointment.patient.id}
          appointmentId={appointmentId}
        />
      </div>
    </div>
  )
}

