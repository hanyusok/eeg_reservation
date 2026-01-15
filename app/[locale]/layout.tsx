import { notFound } from "next/navigation"
import { getMessages, supportedLocales, type Locale } from "@/lib/i18n"

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }))
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

  if (!supportedLocales.includes(locale as Locale)) {
    notFound()
  }

  // Preload messages for child routes that may import them
  getMessages(locale)

  return <>{children}</>
}
