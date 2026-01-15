import en from "@/locales/en.json"
import ko from "@/locales/ko.json"

export const supportedLocales = ["en", "ko"] as const
export type Locale = (typeof supportedLocales)[number]

const messages = {
  en,
  ko,
} as const

export function getMessages(locale: string) {
  if (!supportedLocales.includes(locale as Locale)) {
    return messages.en
  }
  return messages[locale as Locale]
}

export function getLocaleFromPathname(pathname?: string | null): Locale | null {
  if (!pathname) return null
  const matched = supportedLocales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )
  return matched || null
}

export function withLocalePath(locale: string | null | undefined, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`
  if (!locale || !supportedLocales.includes(locale as Locale)) {
    return normalized
  }
  const prefix = `/${locale}`
  if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
    return normalized
  }
  return `${prefix}${normalized}`
}
