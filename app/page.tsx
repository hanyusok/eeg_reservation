"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getMessages } from "@/lib/i18n"

export default function Home() {
  const messages = getMessages("en")
  const router = useRouter()

  useEffect(() => {
    try {
      const preferredLocale = localStorage.getItem("preferredLocale")
      if (preferredLocale === "en" || preferredLocale === "ko") {
        router.replace(`/${preferredLocale}`)
      }
    } catch {
      // No-op: localStorage may be unavailable in some environments
    }
  }, [router])

  const handleLocaleClick = (locale: "en" | "ko") => {
    try {
      localStorage.setItem("preferredLocale", locale)
    } catch {
      // No-op: localStorage may be unavailable in some environments
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm space-y-10">
        <div>
          <h1 className="text-4xl font-bold text-center mb-4">
            {messages.home.title}
          </h1>
          <p className="text-center text-muted-foreground">
            {messages.home.subtitle}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">
            {messages.language.title}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {messages.language.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild onClick={() => handleLocaleClick("en")}>
              <Link href="/en">{messages.language.english}</Link>
            </Button>
            <Button asChild variant="outline" onClick={() => handleLocaleClick("ko")}>
              <Link href="/ko">{messages.language.korean}</Link>
            </Button>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/auth/login">{messages.home.ctaLogin}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/register">{messages.auth.register.createAccount}</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

