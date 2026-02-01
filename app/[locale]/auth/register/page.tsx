"use client"

import { useMemo, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMessages } from "@/lib/i18n-client"
import { withLocalePath, type Locale } from "@/lib/i18n"

const createRegisterSchema = (messages: any) =>
  z
    .object({
      firstName: z.string().min(1, messages.auth.register.errors.firstNameRequired),
      lastName: z.string().min(1, messages.auth.register.errors.lastNameRequired),
      email: z.string().email(messages.auth.register.errors.invalidEmail),
      password: z.string().min(6, messages.auth.register.errors.passwordMin),
      confirmPassword: z.string(),
      phone: z.string().optional(),
      role: z.enum(["patient", "parent"]),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.auth.register.errors.passwordMismatch,
      path: ["confirmPassword"],
    })

type RegisterForm = z.infer<ReturnType<typeof createRegisterSchema>>

export default function LocalizedRegisterPage(props: {
  params: Promise<{ locale: string }>
}) {
  const params = use(props.params)
  const locale = params.locale as Locale
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { messages } = useMessages()

  const registerSchema = useMemo(() => createRegisterSchema(messages), [messages])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "parent",
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          role: data.role,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || messages.auth.register.errors.registrationFailed)
        setIsLoading(false)
        return
      }

      router.push(withLocalePath(locale, "/auth/login?registered=true"))
    } catch (err) {
      setError(messages.auth.register.errors.generic)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-center">
            {messages.auth.register.title}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {messages.auth.register.subtitle}{" "}
            <Link
              href={withLocalePath(locale, "/auth/login")}
              className="text-primary hover:underline"
            >
              {messages.auth.register.signIn}
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium">
                {messages.auth.register.firstNameLabel}
              </label>
              <input
                {...register("firstName")}
                type="text"
                id="firstName"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">
                {messages.auth.register.lastNameLabel}
              </label>
              <input
                {...register("lastName")}
                type="text"
                id="lastName"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              {messages.auth.register.emailLabel}
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={messages.auth.register.emailPlaceholder}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium">
              {messages.auth.register.phoneLabel}
            </label>
            <input
              {...register("phone")}
              type="tel"
              id="phone"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={messages.auth.register.phonePlaceholder}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium">
              {messages.auth.register.roleLabel}
            </label>
            <select
              {...register("role")}
              id="role"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="parent">{messages.auth.register.roleParent}</option>
              <option value="patient">{messages.auth.register.rolePatient}</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              {messages.auth.register.passwordLabel}
            </label>
            <input
              {...register("password")}
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={messages.auth.register.passwordPlaceholder}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              {messages.auth.register.confirmPasswordLabel}
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              id="confirmPassword"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={messages.auth.register.confirmPasswordPlaceholder}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? messages.auth.register.creatingAccount
              : messages.auth.register.createAccount}
          </Button>
        </form>
      </div>
    </div>
  )
}
