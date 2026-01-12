"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react"

interface Appointment {
  id: string
  appointmentType: string
  scheduledAt: string
  durationMinutes: number
  status: string
  notes: string | null
  calendlyEventId: string | null
  createdAt: string
  updatedAt: string
  patient: {
    id: string
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }
  parent: {
    id: string
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

export default function AppointmentDetail({
  appointmentId,
}: {
  appointmentId: string
}) {
  const router = useRouter()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [editData, setEditData] = useState({
    notes: "",
    scheduledAt: "",
  })
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointment()
  }, [appointmentId])

  const fetchAppointment = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      const response = await fetch(`/api/appointments/${appointmentId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Appointment not found")
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to view this appointment")
        }
        throw new Error("Failed to fetch appointment")
      }

      const data = await response.json()
      setAppointment(data.appointment)
      setEditData({
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
      setError(null)
      setSuccess(null)
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: editData.notes,
          scheduledAt: new Date(editData.scheduledAt).toISOString(),
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to update appointment")
      }

      setSuccess("Appointment updated successfully!")
      setIsEditing(false)
      await fetchAppointment()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this appointment? This action cannot be undone."
      )
    ) {
      return
    }

    try {
      setIsCancelling(true)
      setError(null)
      setSuccess(null)
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to cancel appointment")
      }

      setSuccess("Appointment cancelled successfully!")
      await fetchAppointment()
      setTimeout(() => {
        setSuccess(null)
        router.push("/appointments")
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsCancelling(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "rescheduled":
        return <RefreshCw className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const start = new Date(startTime)
    const end = new Date(start.getTime() + durationMinutes * 60000)
    return end.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <BackButton href="/appointments" />
        <div className="mt-6 rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Appointment
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={fetchAppointment} variant="outline">
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/appointments">Back to Appointments</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <BackButton href="/appointments" />
        <div className="mt-6 text-center py-12">
          <p className="text-muted-foreground mb-4">Appointment not found.</p>
          <Button asChild>
            <Link href="/appointments">Back to Appointments</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <BackButton href="/appointments" />
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {formatAppointmentType(appointment.appointmentType)}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  appointment.status
                )}`}
              >
                {getStatusIcon(appointment.status)}
                {appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1)}
              </span>
            </div>
          </div>
          {appointment.status === "scheduled" && (
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="destructive"
                    size="sm"
                    disabled={isCancelling}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isCancelling ? "Cancelling..." : "Cancel"}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleUpdate} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      fetchAppointment()
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-800 dark:text-green-200">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointment Details Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Details
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="scheduledAt" className="text-sm font-medium text-muted-foreground mb-1">
                Scheduled Date & Time
              </Label>
              {isEditing ? (
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={editData.scheduledAt}
                  onChange={(e) =>
                    setEditData({ ...editData, scheduledAt: e.target.value })
                  }
                  className="mt-1"
                />
              ) : (
                <p className="text-lg font-semibold mt-1">
                  {formatDate(appointment.scheduledAt)}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration
              </p>
              <p className="text-lg">
                {appointment.durationMinutes} minutes
                {appointment.scheduledAt && (
                  <span className="text-muted-foreground ml-2">
                    ({new Date(appointment.scheduledAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {calculateEndTime(appointment.scheduledAt, appointment.durationMinutes)})
                  </span>
                )}
              </p>
            </div>

            {appointment.calendlyEventId && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Calendly Event ID
                </p>
                <p className="text-sm font-mono">{appointment.calendlyEventId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Patient Information Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Patient Name
              </p>
              <p className="text-lg font-semibold">
                {appointment.patient.user.firstName}{" "}
                {appointment.patient.user.lastName}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="text-sm">{appointment.patient.user.email}</p>
            </div>
          </div>
        </div>

        {/* Parent/Guardian Information Card */}
        {appointment.parent && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Parent/Guardian
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Name
                </p>
                <p className="text-lg font-semibold">
                  {appointment.parent.firstName} {appointment.parent.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="text-sm">{appointment.parent.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes
          </h2>
          {isEditing ? (
            <div>
              <Label htmlFor="notes" className="sr-only">
                Notes
              </Label>
              <textarea
                id="notes"
                value={editData.notes}
                onChange={(e) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add notes about this appointment..."
              />
            </div>
          ) : appointment.notes ? (
            <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No notes available for this appointment.
            </p>
          )}
        </div>
      </div>

      {/* Documents Section */}
      {appointment.documents && appointment.documents.length > 0 && (
        <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Related Documents
          </h2>
          <div className="space-y-2">
            {appointment.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-md border bg-background"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.fileType} •{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <Button asChild variant="outline">
          <Link href="/appointments">Back to Appointments</Link>
        </Button>
      </div>
    </div>
  )
}
