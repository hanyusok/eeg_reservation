"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export default function AdminPatientsList() {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const { messages } = useMessages()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/patients")
      if (!response.ok) {
        throw new Error(messages.adminPatientsList.errors.fetchFailed)
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
      month: "short",
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

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      patient.user.firstName.toLowerCase().includes(searchLower) ||
      patient.user.lastName.toLowerCase().includes(searchLower) ||
      patient.user.email.toLowerCase().includes(searchLower) ||
      (patient.medicalRecordNumber &&
        patient.medicalRecordNumber.toLowerCase().includes(searchLower))
    )
  })

  if (loading) {
    return (
      <div className="text-center py-8">{messages.adminPatientsList.loading}</div>
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

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-4">
        <Input
          type="text"
          placeholder={messages.adminPatientsList.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Patients Table */}
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg bg-card">
            {searchTerm
              ? messages.adminPatientsList.emptySearch
              : messages.adminPatientsList.empty}
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="p-4 rounded-lg border bg-card shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg">
                    {patient.user.firstName} {patient.user.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {patient.user.email}
                  </div>
                </div>
                <div className="text-sm bg-secondary px-2 py-1 rounded">
                  {calculateAge(patient.dateOfBirth)} {messages.adminPatientsList.years}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground block">{messages.adminPatientsList.columns.mrn}</span>
                  {patient.medicalRecordNumber || "-"}
                </div>
                <div>
                  <span className="text-muted-foreground block">{messages.adminPatientsList.columns.parent}</span>
                  {patient.parent ? `${patient.parent.firstName} ${patient.parent.lastName}` : "-"}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <div className="text-sm">
                  {messages.adminPatientsList.columns.appointments}: <span className="font-medium">{patient._count.appointments}</span>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="ghost" size="sm" className="h-8">
                    <Link href={withLocalePath(locale, `/admin/patients/${patient.id}`)}>
                      {messages.adminPatientsList.actions.view}
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="h-8">
                    <Link href={withLocalePath(locale, `/admin/patients/${patient.id}/edit`)}>
                      {messages.common.edit}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  {messages.adminPatientsList.columns.name}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  {messages.adminPatientsList.columns.age}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  {messages.adminPatientsList.columns.email}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  {messages.adminPatientsList.columns.mrn}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  {messages.adminPatientsList.columns.parent}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  {messages.adminPatientsList.columns.appointments}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  {messages.adminPatientsList.columns.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {searchTerm
                      ? messages.adminPatientsList.emptySearch
                      : messages.adminPatientsList.empty}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-accent/50">
                    <td className="px-4 py-3">
                      {patient.user.firstName} {patient.user.lastName}
                    </td>
                    <td className="px-4 py-3">
                      {calculateAge(patient.dateOfBirth)} {messages.adminPatientsList.years}
                    </td>
                    <td className="px-4 py-3">{patient.user.email}</td>
                    <td className="px-4 py-3">
                      {patient.medicalRecordNumber || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {patient.parent
                        ? `${patient.parent.firstName} ${patient.parent.lastName}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">{patient._count.appointments}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={withLocalePath(locale, `/admin/patients/${patient.id}`)}>
                            {messages.adminPatientsList.actions.view}
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={withLocalePath(locale, `/admin/patients/${patient.id}/edit`)}
                          >
                            {messages.common.edit}
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {messages.adminPatientsList.showing
          .replace("{{filtered}}", String(filteredPatients.length))
          .replace("{{total}}", String(patients.length))}
      </div>
    </div>
  )
}

