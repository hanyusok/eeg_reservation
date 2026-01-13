"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const patientSchema = z.object({
  // User information (for creating new user account)
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  // Family relationship
  parentEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  // Patient information
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  medicalRecordNumber: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
})

type PatientForm = z.infer<typeof patientSchema>

export default function PatientForm({ patientId, initialData }: { patientId?: string; initialData?: any }) {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode] = useState(!!patientId)
  const [parentInfo, setParentInfo] = useState<{ id: string; name: string } | null>(null)
  const [searchingParent, setSearchingParent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData || {},
  })

  useEffect(() => {
    // For new patients, we'll create a user account or link to existing
    // For now, we'll skip user selection for simplicity
  }, [])

  const searchParent = async (email: string) => {
    if (!email || email.trim() === "") {
      setParentInfo(null)
      return
    }

    try {
      setSearchingParent(true)
      const response = await fetch(`/api/users/by-email?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.user && data.user.role === "parent") {
          setParentInfo({
            id: data.user.id,
            name: `${data.user.firstName} ${data.user.lastName}`,
          })
        } else {
          setParentInfo(null)
          setError("User found but is not a parent account")
        }
      } else {
        setParentInfo(null)
      }
    } catch (err) {
      setParentInfo(null)
    } finally {
      setSearchingParent(false)
    }
  }

  const onSubmit = async (data: PatientForm) => {
    try {
      setLoading(true)
      setError(null)

      if (patientId) {
        // Update existing patient
        const response = await fetch(`/api/patients/${patientId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateOfBirth: new Date(data.dateOfBirth).toISOString(),
            medicalRecordNumber: data.medicalRecordNumber,
            medicalHistory: data.medicalHistory,
            currentMedications: data.currentMedications,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to update patient")
        }

        router.push("/patients")
        router.refresh()
      } else {
        // Create new patient - first create user account, then patient profile
        // Step 1: Create user account for the patient
        const userResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            role: "patient",
            password: "temp_password_" + Math.random().toString(36).slice(2), // Temporary password
          }),
        })

        const userResult = await userResponse.json()

        if (!userResponse.ok) {
          // If user already exists, try to find them
          if (userResult.error?.includes("already exists")) {
            // Try to find existing user by email
            const findUserResponse = await fetch(`/api/users/by-email?email=${encodeURIComponent(data.email)}`)
            if (findUserResponse.ok) {
              const userData = await findUserResponse.json()
              // Use existing user
              await createPatientProfile(userData.user.id, data)
            } else {
              throw new Error(userResult.error || "Failed to create user account")
            }
          } else {
            // Show detailed validation errors if available
            if (userResult.details && Array.isArray(userResult.details)) {
              const errorMessages = userResult.details.map((err: any) => 
                `${err.path.join('.')}: ${err.message}`
              ).join(', ')
              throw new Error(errorMessages || userResult.error || "Failed to create user account")
            }
            throw new Error(userResult.error || "Failed to create user account")
          }
        } else {
          // Step 2: Create patient profile
          await createPatientProfile(userResult.user.id, data)
        }
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const createPatientProfile = async (userId: string, data: PatientForm) => {
    // Get parentId if parent email was provided
    let parentId: string | undefined = undefined
    if (data.parentEmail && data.parentEmail.trim() !== "") {
      if (parentInfo) {
        parentId = parentInfo.id
      } else {
        // Try to find parent by email
        try {
          const parentResponse = await fetch(`/api/users/by-email?email=${encodeURIComponent(data.parentEmail)}`)
          if (parentResponse.ok) {
            const parentData = await parentResponse.json()
            if (parentData.user && parentData.user.role === "parent") {
              parentId = parentData.user.id
            }
          }
        } catch (err) {
          // If parent not found, continue without parent
        }
      }
    }

    const response = await fetch("/api/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        parentId,
        dateOfBirth: data.dateOfBirth, // Send as YYYY-MM-DD string, not ISO
        medicalRecordNumber: data.medicalRecordNumber || undefined,
        medicalHistory: data.medicalHistory || undefined,
        currentMedications: data.currentMedications || undefined,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      // Show detailed validation errors if available
      if (result.details && Array.isArray(result.details)) {
        const errorMessages = result.details.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ')
        throw new Error(errorMessages || result.error || "Failed to create patient profile")
      }
      throw new Error(result.error || "Failed to create patient profile")
    }

    router.push("/patients")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isEditMode && (
        <>
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                {...register("firstName")}
                type="text"
                id="firstName"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                {...register("lastName")}
                type="text"
                id="lastName"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              {...register("email")}
              type="email"
              id="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              {...register("phone")}
              type="tel"
              id="phone"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="parentEmail">Parent/Guardian Email (Optional)</Label>
            <Input
              {...register("parentEmail")}
              type="email"
              id="parentEmail"
              placeholder="parent@example.com"
              onBlur={(e) => {
                if (e.target.value) {
                  searchParent(e.target.value)
                }
              }}
            />
            {parentInfo && (
              <p className="mt-1 text-sm text-green-600">
                ✓ Found: {parentInfo.name}
              </p>
            )}
            {searchingParent && (
              <p className="mt-1 text-sm text-muted-foreground">Searching...</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Enter the email of an existing parent/guardian account to link this patient
            </p>
          </div>
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
          </div>
        </>
      )}

      <div>
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          {...register("dateOfBirth")}
          type="date"
          id="dateOfBirth"
          max={new Date().toISOString().split("T")[0]}
        />
        {errors.dateOfBirth && (
          <p className="mt-1 text-sm text-destructive">
            {errors.dateOfBirth.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="medicalRecordNumber">Medical Record Number</Label>
        <Input
          {...register("medicalRecordNumber")}
          type="text"
          id="medicalRecordNumber"
          placeholder="Optional"
        />
      </div>

      <div>
        <Label htmlFor="medicalHistory">Medical History</Label>
        <textarea
          {...register("medicalHistory")}
          id="medicalHistory"
          rows={4}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Previous medical conditions, surgeries, etc."
        />
      </div>

      <div>
        <Label htmlFor="currentMedications">Current Medications</Label>
        <textarea
          {...register("currentMedications")}
          id="currentMedications"
          rows={3}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="List current medications and dosages"
        />
      </div>

      <div>
        <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
        <Input
          {...register("emergencyContactName")}
          type="text"
          id="emergencyContactName"
        />
        {errors.emergencyContactName && (
          <p className="mt-1 text-sm text-destructive">
            {errors.emergencyContactName.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
        <Input
          {...register("emergencyContactPhone")}
          type="tel"
          id="emergencyContactPhone"
          placeholder="+1 (555) 123-4567"
        />
        {errors.emergencyContactPhone && (
          <p className="mt-1 text-sm text-destructive">
            {errors.emergencyContactPhone.message}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEditMode ? "Update Patient" : "Create Patient"}
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

