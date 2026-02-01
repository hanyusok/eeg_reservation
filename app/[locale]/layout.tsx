import { notFound } from "next/navigation"
import { getMessages, supportedLocales, type Locale } from "@/lib/i18n"

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }))
}

export default async function LocaleLayout(
  props: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
  }
) {
  const params = await props.params
  const { locale } = params
  const { children } = props

  if (!supportedLocales.includes(locale as Locale)) {
    notFound()
  }

  // Preload messages for child routes that may import them
  getMessages(locale)

  return <>{children}</>
}
