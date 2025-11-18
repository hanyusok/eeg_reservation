"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
        throw new Error("Failed to fetch patients")
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
    return <div className="text-center py-8">Loading patients...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error: {error}
        <Button onClick={fetchPatients} className="ml-4" variant="outline">
          Retry
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
          placeholder="Search patients by name, email, or MRN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Patients Table */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Patient Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  MRN
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Parent
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Appointments
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    {searchTerm ? "No patients found matching your search" : "No patients found"}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-accent/50">
                    <td className="px-4 py-3">
                      {patient.user.firstName} {patient.user.lastName}
                    </td>
                    <td className="px-4 py-3">{calculateAge(patient.dateOfBirth)} years</td>
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
                          <Link href={`/admin/patients/${patient.id}`}>View</Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/patients/${patient.id}/edit`}>Edit</Link>
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
        Showing {filteredPatients.length} of {patients.length} patients
      </div>
    </div>
  )
}

