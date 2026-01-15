"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  Edit,
  RefreshCw,
  Clock,
  Heart,
  UserCircle,
  FileCheck,
} from "lucide-react"
import { getLocaleFromPathname, withLocalePath } from "@/lib/i18n"
import { useMessages } from "@/lib/i18n-client"

interface PatientDetail {
  id: string
  dateOfBirth: string
  medicalRecordNumber: string | null
  medicalHistory: string | null
  currentMedications: string | null
  emergencyContactName: string
  emergencyContactPhone: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }
  parent: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  appointments: Array<{
    id: string
    appointmentType: string
    scheduledAt: string
    status: string
    durationMinutes: number
  }>
  documents: Array<{
    id: string
    fileName: string
    fileType: string
    uploadedAt: string
  }>
}

interface PatientDetailProps {
  patientId: string
}

export default function PatientDetail({ patientId }: PatientDetailProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const { messages } = useMessages()
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatient()
  }, [patientId])

  const fetchPatient = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/patients/${patientId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(messages.patientDetail.errors.notFound)
        }
        if (response.status === 403) {
          throw new Error(messages.patientDetail.errors.forbidden)
        }
        throw new Error(messages.patientDetail.errors.fetchFailed)
      }

      const data = await response.json()
      setPatient(data.patient)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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
    switch (status.toLowerCase()) {
      case "scheduled":
        return "text-blue-600 bg-blue-50"
      case "completed":
        return "text-green-600 bg-green-50"
      case "cancelled":
        return "text-red-600 bg-red-50"
      case "rescheduled":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">
          {messages.patientDetail.loading}
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
        <div className="flex gap-2">
          <Button onClick={fetchPatient} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {messages.common.retry}
          </Button>
          <Button onClick={() => router.back()} variant="outline">
            {messages.common.back}
          </Button>
        </div>
      </div>
    )
  }

  if (!patient) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Patient Basic Information Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <UserCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {patient.user.firstName} {patient.user.lastName}
              </h2>
              <p className="text-muted-foreground">
                {calculateAge(patient.dateOfBirth)} {messages.patientDetail.yearsOld}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link
                href={withLocalePath(
                  locale,
                  `/appointments/book?patientId=${patient.id}`
                )}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {messages.patientDetail.bookAppointment}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={withLocalePath(locale, `/patients/${patient.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                {messages.common.edit}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {messages.patientDetail.labels.email}
            </p>
            <p className="text-sm">{patient.user.email}</p>
          </div>

          {patient.user.phone && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {messages.patientDetail.labels.phone}
              </p>
              <p className="text-sm">{patient.user.phone}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {messages.patientDetail.labels.dateOfBirth}
            </p>
            <p className="text-sm">{formatDate(patient.dateOfBirth)}</p>
          </div>

          {patient.medicalRecordNumber && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                {messages.patientDetail.labels.mrn}
              </p>
              <p className="text-sm font-mono">{patient.medicalRecordNumber}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Parent/Guardian Information Card */}
        {patient.parent && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              {messages.patientDetail.sections.parent}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {messages.patientDetail.labels.name}
                </p>
                <p className="text-lg font-semibold">
                  {patient.parent.firstName} {patient.parent.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {messages.patientDetail.labels.email}
                </p>
                <p className="text-sm">{patient.parent.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {messages.patientDetail.sections.emergency}
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {messages.patientDetail.labels.name}
              </p>
              <p className="text-lg font-semibold">
                {patient.emergencyContactName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {messages.patientDetail.labels.phone}
              </p>
              <p className="text-sm">{patient.emergencyContactPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Information Card */}
      {(patient.medicalHistory || patient.currentMedications) && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {messages.patientDetail.sections.medical}
          </h3>
          <div className="space-y-4">
            {patient.medicalHistory && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {messages.patientDetail.labels.medicalHistory}
                </p>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                  {patient.medicalHistory}
                </p>
              </div>
            )}
            {patient.currentMedications && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {messages.patientDetail.labels.currentMedications}
                </p>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                  {patient.currentMedications}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Appointments Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {messages.patientDetail.sections.recentAppointments}
          </h3>
          <Button asChild variant="outline" size="sm">
            <Link href={withLocalePath(locale, `/patients/${patient.id}/appointments`)}>
              {messages.patientDetail.viewAll}
            </Link>
          </Button>
        </div>
        {patient.appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {messages.patientDetail.noAppointments}
          </p>
        ) : (
          <div className="space-y-3">
            {patient.appointments.map((appointment) => (
              <Link
                key={appointment.id}
                href={withLocalePath(locale, `/appointments/${appointment.id}`)}
                className="block rounded-md border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      {getAppointmentTypeLabel(appointment.appointmentType)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(appointment.scheduledAt)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {messages.patientDetail.durationLabel}{" "}
                      {appointment.durationMinutes} {messages.patientDetail.minutes}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {messages.status[appointment.status as keyof typeof messages.status] ||
                      appointment.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Documents Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {messages.patientDetail.sections.recentDocuments}
          </h3>
        </div>
        {patient.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {messages.patientDetail.noDocuments}
          </p>
        ) : (
          <div className="space-y-2">
            {patient.documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{document.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(document.uploadedAt)} • {document.fileType}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
