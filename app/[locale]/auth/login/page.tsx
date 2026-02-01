"use client"

import { useMemo, useState, use } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Chrome, MessageCircle } from "lucide-react"
import { useMessages } from "@/lib/i18n-client"
import { withLocalePath, type Locale } from "@/lib/i18n"

const createLoginSchema = (messages: any) =>
  z.object({
    email: z.string().email(messages.auth.login.errors.invalidEmail),
    password: z.string().min(6, messages.auth.login.errors.passwordMin),
  })

type LoginForm = z.infer<ReturnType<typeof createLoginSchema>>

export default function LocalizedLoginPage(props: {
  params: Promise<{ locale: string }>
}) {
  const params = use(props.params)
  const locale = params.locale as Locale
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { messages } = useMessages()

  const loginSchema = useMemo(() => createLoginSchema(messages), [messages])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError(messages.auth.login.errors.invalidCredentials)
        setIsLoading(false)
        return
      }

      router.push(withLocalePath(locale, "/dashboard"))
      router.refresh()
    } catch (err) {
      setError(messages.auth.login.errors.generic)
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "google" | "kakao") => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(provider, {
        callbackUrl: withLocalePath(locale, "/dashboard"),
        redirect: true,
      })
    } catch (err) {
      setError(
        messages.auth.login.errors.oauthFailed.replace("{{provider}}", provider)
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-center">
            {messages.auth.login.title}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {messages.auth.login.subtitle}{" "}
            <Link
              href={withLocalePath(locale, "/auth/register")}
              className="text-primary hover:underline"
            >
              {messages.auth.login.createAccount}
            </Link>
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            {messages.auth.login.continueWithGoogle}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn("kakao")}
            disabled={isLoading}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {messages.auth.login.continueWithKakao}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {messages.auth.login.orContinueWith}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              {messages.auth.login.emailLabel}
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={messages.auth.login.emailPlaceholder}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              {messages.auth.login.passwordLabel}
            </label>
            <input
              {...register("password")}
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={messages.auth.login.passwordPlaceholder}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? messages.auth.login.signingIn : messages.auth.login.signIn}
          </Button>
        </form>
      </div>
    </div>
  )
}
