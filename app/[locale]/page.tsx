import Link from "next/link"
import { getMessages, supportedLocales, type Locale, withLocalePath } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

export default async function LocalizedHomePage(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params
  const locale = params.locale as Locale
  const messages = getMessages(locale)

  const dashboardHref = withLocalePath(locale, "/dashboard")

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="rounded-lg border bg-card p-8">
        <h1 className="text-3xl font-bold">{messages.home.title}</h1>
        <p className="text-muted-foreground mt-2">{messages.home.subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/auth/login">{messages.home.ctaLogin}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={dashboardHref}>{messages.home.ctaDashboard}</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Locale: {supportedLocales.includes(locale) ? locale : "en"}
        </p>
      </div>
    </div>
  )
}
