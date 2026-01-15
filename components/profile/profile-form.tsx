"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Save, Lock, Eye, EyeOff } from "lucide-react"
import { useMessages } from "@/lib/i18n-client"
import { withLocalePath } from "@/lib/i18n"

const createProfileSchema = (messages: any) =>
  z.object({
    firstName: z.string().min(1, messages.profileForm.errors.firstNameRequired),
    lastName: z.string().min(1, messages.profileForm.errors.lastNameRequired),
    email: z.string().email(messages.profileForm.errors.invalidEmail),
    phone: z.string().optional(),
  })

const createPasswordSchema = (messages: any) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, messages.profileForm.errors.currentPasswordRequired),
      newPassword: z
        .string()
        .min(6, messages.profileForm.errors.newPasswordMin),
      confirmPassword: z
        .string()
        .min(1, messages.profileForm.errors.confirmPasswordRequired),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: messages.profileForm.errors.passwordMismatch,
      path: ["confirmPassword"],
    })

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface ProfileFormProps {
  initialData: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string | null
    role: string
    createdAt: Date | string
    updatedAt: Date | string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { messages, locale } = useMessages()

  const profileSchema = useMemo(() => createProfileSchema(messages), [messages])
  const passwordSchema = useMemo(() => createPasswordSchema(messages), [messages])

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      phone: initialData.phone || "",
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    resetProfile({
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      phone: initialData.phone || "",
    })
  }, [initialData, resetProfile])

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || messages.profileForm.errors.updateFailed)
      }

      setSuccess(messages.profileForm.success.profileUpdated)
      
      // Refresh the page to show updated data
      // This will trigger a server-side re-render with fresh data from database
      router.refresh()
      
      // Optionally redirect to dashboard to see updated profile
      setTimeout(() => {
        router.push(withLocalePath(locale, "/dashboard"))
      }, 1500)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || messages.profileForm.errors.updateGeneric)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || messages.profileForm.errors.changePasswordFailed)
      }

      setSuccess(messages.profileForm.success.passwordChanged)
      setShowPasswordForm(false)
      resetPassword()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || messages.profileForm.errors.changePasswordGeneric)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "doctor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "parent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "patient":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return messages.roles.admin
      case "doctor":
        return messages.roles.doctor
      case "parent":
        return messages.roles.parent
      case "patient":
        return messages.roles.patient
      default:
        return role
    }
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-800 dark:text-green-200">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Profile Information Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={undefined} alt={`${initialData.firstName} ${initialData.lastName}`} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(initialData.firstName, initialData.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">
              {initialData.firstName} {initialData.lastName}
            </h2>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(
                initialData.role
              )}`}
            >
              {getRoleLabel(initialData.role)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName">
                <User className="h-4 w-4 inline mr-2" />
                {messages.profileForm.labels.firstName}
              </Label>
              <Input
                id="firstName"
                {...registerProfile("firstName")}
                className="mt-1"
                disabled={isLoading}
              />
              {profileErrors.firstName && (
                <p className="mt-1 text-sm text-destructive">
                  {profileErrors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">
                <User className="h-4 w-4 inline mr-2" />
                {messages.profileForm.labels.lastName}
              </Label>
              <Input
                id="lastName"
                {...registerProfile("lastName")}
                className="mt-1"
                disabled={isLoading}
              />
              {profileErrors.lastName && (
                <p className="mt-1 text-sm text-destructive">
                  {profileErrors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">
              <Mail className="h-4 w-4 inline mr-2" />
              {messages.profileForm.labels.email}
            </Label>
            <Input
              id="email"
              type="email"
              {...registerProfile("email")}
              className="mt-1"
              disabled={isLoading}
            />
            {profileErrors.email && (
              <p className="mt-1 text-sm text-destructive">
                {profileErrors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">
              <Phone className="h-4 w-4 inline mr-2" />
              {messages.profileForm.labels.phone}
            </Label>
            <Input
              id="phone"
              type="tel"
              {...registerProfile("phone")}
              className="mt-1"
              placeholder={messages.profileForm.placeholders.phone}
              disabled={isLoading}
            />
            {profileErrors.phone && (
              <p className="mt-1 text-sm text-destructive">
                {profileErrors.phone.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading
                ? messages.profileForm.actions.saving
                : messages.profileForm.actions.saveChanges}
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            {messages.profileForm.password.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {messages.profileForm.password.subtitle}
          </p>
        </div>

        {!showPasswordForm ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPasswordForm(true)}
          >
            {messages.profileForm.password.openForm}
          </Button>
        ) : (
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">
                {messages.profileForm.password.currentPassword}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  {...registerPassword("currentPassword")}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">
                {messages.profileForm.password.newPassword}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...registerPassword("newPassword")}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">
                {messages.profileForm.password.confirmPassword}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...registerPassword("confirmPassword")}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(false)
                  resetPassword()
                  setError(null)
                }}
                disabled={isLoading}
              >
                {messages.common.cancel}
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Lock className="h-4 w-4 mr-2" />
                {isLoading
                  ? messages.profileForm.password.changing
                  : messages.profileForm.password.change}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Account Information */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          {messages.profileForm.account.title}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {messages.profileForm.account.createdAt}
            </span>
            <span className="font-medium">
              {new Date(initialData.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {messages.profileForm.account.updatedAt}
            </span>
            <span className="font-medium">
              {new Date(initialData.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {messages.profileForm.account.userId}
            </span>
            <span className="font-mono text-xs">
              {initialData.id.substring(0, 8)}...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
