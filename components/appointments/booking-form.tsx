"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMessages } from "@/lib/i18n-client"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"

const createBookingSchema = (messages: any) =>
  z.object({
    patientId: z.string().uuid(messages.bookingForm.errors.selectPatient),
    appointmentType: z.enum([
      "initial_consultation",
      "eeg_monitoring",
      "follow_up",
    ]),
    scheduledAt: z.string().min(1, messages.bookingForm.errors.selectDateTime),
    durationMinutes: z.number().int().positive().default(60),
    notes: z.string().optional(),
  })

type BookingForm = z.infer<ReturnType<typeof createBookingSchema>>

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
  const { messages } = useMessages()
  const bookingSchema = useMemo(() => createBookingSchema(messages), [messages])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingPatients, setLoadingPatients] = useState(true)

  // Scheduling State
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      appointmentType: "eeg_monitoring",
      durationMinutes: 60,
    },
  })

  useEffect(() => {
    fetchPatients()

    // Check if patientId is in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const patientIdParam = urlParams.get("patientId")
    if (patientIdParam) {
      setValue("patientId", patientIdParam)
    }
  }, [setValue])

  // Fetch slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate)
      setSelectedSlot(null) // Reset selection
      setValue("scheduledAt", "") // Reset form value
    }
  }, [selectedDate])

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true)
      const response = await fetch("/api/patients")
      if (!response.ok) {
        throw new Error(messages.bookingForm.errors.fetchPatientsFailed)
      }
      const data = await response.json()
      setPatients(data.patients || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingPatients(false)
    }
  }

  const fetchSlots = async (date: Date) => {
    setLoadingSlots(true)
    setAvailableSlots([])
    try {
      // Get start/end of day
      const startTime = new Date(date)
      startTime.setHours(0, 0, 0, 0)

      const endTime = new Date(date)
      endTime.setHours(23, 59, 59, 999)

      const query = new URLSearchParams({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })

      const res = await fetch(`/api/appointments/available-slots?${query}`)
      if (res.ok) {
        const data = await res.json()
        setAvailableSlots(data.slots || [])
      }
    } catch (err) {
      console.error("Error fetching slots", err)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot)
    setValue("scheduledAt", slot)
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
        throw new Error(result.error || messages.bookingForm.errors.createFailed)
      }

      router.push(redirectTo || "/appointments")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loadingPatients) {
    return (
      <div className="text-center py-8">{messages.bookingForm.loadingPatients}</div>
    )
  }

  if (patients.length === 0) {
    const newPatientHref = createPatientHref || "/patients/new"
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground mb-4">
          {messages.bookingForm.noPatients}
        </p>
        <Button asChild>
          <Link href={newPatientHref}>{messages.bookingForm.createPatient}</Link>
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

      {/* Patient & Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="patientId">{messages.bookingForm.patientLabel}</Label>
          <select
            {...register("patientId")}
            id="patientId"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{messages.bookingForm.patientPlaceholder}</option>
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
          <Label htmlFor="appointmentType">{messages.bookingForm.typeLabel}</Label>
          <select
            {...register("appointmentType")}
            id="appointmentType"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="initial_consultation">
              {messages.bookingForm.types.initialConsultation}
            </option>
            <option value="eeg_monitoring">{messages.bookingForm.types.eegMonitoring}</option>
            <option value="follow_up">{messages.bookingForm.types.followUp}</option>
          </select>
        </div>
      </div>

      {/* Date & Time Selection */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4 text-lg">Select Date & Time</h3>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Calendar */}
          <div className="flex-none">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < addDays(new Date(), -1)} // Disable past dates
              className="rounded-md border shadow-sm"
              initialFocus
            />
          </div>

          {/* Time Slots */}
          <div className="flex-1">
            {!selectedDate ? (
              <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed p-8">
                Select a date to view available times
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-medium">
                  Available Slots for {format(selectedDate, "PPP")}
                </h4>

                {loadingSlots ? (
                  <div className="text-center py-8">Loading available times...</div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No availability on this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        className={cn(
                          "w-full px-4 py-2 text-sm rounded-md border transition-colors",
                          selectedSlot === slot
                            ? "bg-primary text-primary-foreground border-primary font-medium"
                            : "bg-background hover:bg-muted border-input"
                        )}
                      >
                        {format(new Date(slot), "h:mm a")}
                      </button>
                    ))}
                  </div>
                )}
                {errors.scheduledAt && (
                  <p className="text-sm text-destructive mt-2">
                    {errors.scheduledAt.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden input to hold the value for form validation */}
      <input type="hidden" {...register("scheduledAt")} />

      <div>
        <Label htmlFor="notes">{messages.bookingForm.notesLabel}</Label>
        <textarea
          {...register("notes")}
          id="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={messages.bookingForm.notesPlaceholder}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading} size="lg" className="w-full md:w-auto">
          {loading ? messages.bookingForm.booking : messages.bookingForm.submit}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          className="w-full md:w-auto"
        >
          {messages.common.cancel}
        </Button>
      </div>
    </form>
  )
}
