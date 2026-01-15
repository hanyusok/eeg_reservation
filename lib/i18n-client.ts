"use client"

import { usePathname } from "next/navigation"
import { getLocaleFromPathname, getMessages, type Locale } from "@/lib/i18n"

export function useMessages() {
  const pathname = usePathname()
  const locale: Locale = getLocaleFromPathname(pathname) || "en"
  const messages = getMessages(locale)
  return { messages, locale }
}
