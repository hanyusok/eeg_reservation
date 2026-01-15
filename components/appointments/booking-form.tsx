"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const bookingSchema = z.object({
  patientId: z.string().uuid("Please select a patient"),
  appointmentType: z.enum(["initial_consultation", "eeg_monitoring", "follow_up"]),
  scheduledAt: z.string().min(1, "Please select a date and time"),
  durationMinutes: z.number().int().positive().default(60),
  notes: z.string().optional(),
})

type BookingForm = z.infer<typeof bookingSchema>

interface Patient {
  id: string
  user: {
    firstName: string
    lastName: string
  }
  dateOfBirth: string
}

export default function BookingForm({
  redirectTo,
  createPatientHref,
}: {
  redirectTo?: string
  createPatientHref?: string
}) {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingPatients, setLoadingPatients] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      appointmentType: "eeg_monitoring",
      durationMinutes: 60,
    },
  })

  const selectedPatientId = watch("patientId")
  const appointmentType = watch("appointmentType")

  useEffect(() => {
    fetchPatients()
    
    // Check if patientId is in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const patientIdParam = urlParams.get("patientId")
    if (patientIdParam) {
      setValue("patientId", patientIdParam)
    }
  }, [setValue])

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true)
      const response = await fetch("/api/patients")
      if (!response.ok) {
        throw new Error("Failed to fetch patients")
      }
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingPatients(false)
    }
  }

  const onSubmit = async (data: BookingForm) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          scheduledAt: new Date(data.scheduledAt).toISOString(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create appointment")
      }

      router.push(redirectTo || "/appointments")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loadingPatients) {
    return <div className="text-center py-8">Loading patients...</div>
  }

  if (patients.length === 0) {
    const newPatientHref = createPatientHref || "/patients/new"
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground mb-4">
          No patients found. Please create a patient profile first.
        </p>
        <Button asChild>
          <Link href={newPatientHref}>Create Patient Profile</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="patientId">Select Patient *</Label>
        <select
          {...register("patientId")}
          id="patientId"
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">-- Select a patient --</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.user.firstName} {patient.user.lastName} (DOB:{" "}
              {new Date(patient.dateOfBirth).toLocaleDateString()})
            </option>
          ))}
        </select>
        {errors.patientId && (
          <p className="mt-1 text-sm text-destructive">
            {errors.patientId.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="appointmentType">Appointment Type *</Label>
        <select
          {...register("appointmentType")}
          id="appointmentType"
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="initial_consultation">Initial Consultation</option>
          <option value="eeg_monitoring">EEG Monitoring</option>
          <option value="follow_up">Follow-up</option>
        </select>
        {errors.appointmentType && (
          <p className="mt-1 text-sm text-destructive">
            {errors.appointmentType.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="scheduledAt">Date & Time *</Label>
        <Input
          {...register("scheduledAt")}
          type="datetime-local"
          id="scheduledAt"
          min={new Date().toISOString().slice(0, 16)}
        />
        {errors.scheduledAt && (
          <p className="mt-1 text-sm text-destructive">
            {errors.scheduledAt.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="durationMinutes">Duration (minutes) *</Label>
        <Input
          {...register("durationMinutes", { valueAsNumber: true })}
          type="number"
          id="durationMinutes"
          min="15"
          step="15"
          defaultValue={60}
        />
        {errors.durationMinutes && (
          <p className="mt-1 text-sm text-destructive">
            {errors.durationMinutes.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          {...register("notes")}
          id="notes"
          rows={4}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Any additional information about this appointment..."
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Booking..." : "Book Appointment"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

