"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getLocaleFromPathname, withLocalePath } from "@/lib/i18n"
import { useMessages } from "@/lib/i18n-client"

interface Patient {
  id: string
  dateOfBirth: string
  medicalRecordNumber: string | null
  user: {
    firstName: string
    lastName: string
    email: string
  }
  parent: {
    firstName: string
    lastName: string
    email: string
  } | null
  _count: {
    appointments: number
  }
}

export default function PatientsList() {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const { messages } = useMessages()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/patients")
      if (!response.ok) {
        throw new Error(messages.patientsList.errors.fetchFailed)
      }
      const data = await response.json()
      setPatients(data.patients || [])
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

  if (loading) {
    return (
      <div className="text-center py-8">{messages.patientsList.loading}</div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {messages.common.errorPrefix} {error}
        <Button onClick={fetchPatients} className="ml-4" variant="outline">
          {messages.common.retry}
        </Button>
      </div>
    )
  }

  if (patients.length === 0) {
    const newPatientHref = withLocalePath(locale, "/patients/new")
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          {messages.patientsList.empty}
        </p>
        <Button asChild>
          <Link href={newPatientHref}>{messages.patientsList.cta}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                {patient.user.firstName} {patient.user.lastName}
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {messages.patientsList.ageLabel}{" "}
                  {calculateAge(patient.dateOfBirth)} {messages.patientsList.yearsOld}
                </p>
                <p>
                  {messages.patientsList.dobLabel} {formatDate(patient.dateOfBirth)}
                </p>
                {patient.medicalRecordNumber && (
                  <p>
                    {messages.patientsList.mrnLabel} {patient.medicalRecordNumber}
                  </p>
                )}
                {patient.parent && (
                  <p>
                    {messages.patientsList.parentLabel} {patient.parent.firstName}{" "}
                    {patient.parent.lastName}
                  </p>
                )}
                <p>
                  {messages.patientsList.appointmentsLabel}{" "}
                  {patient._count.appointments}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link
                  href={withLocalePath(
                    locale,
                    `/appointments/book?patientId=${patient.id}`
                  )}
                >
                  {messages.patientsList.bookAppointment}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={withLocalePath(locale, `/patients/${patient.id}`)}>
                  {messages.patientsList.viewDetails}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link
                  href={withLocalePath(locale, `/patients/${patient.id}/appointments`)}
                >
                  {messages.patientsList.viewAppointments}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

