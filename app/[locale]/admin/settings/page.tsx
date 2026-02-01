import { auth } from "@/auth"
import { redirect } from "next/navigation"
import SettingsPanel from "@/components/admin/settings-panel"
import AvailabilitySettings from "@/components/admin/availability-settings"
import { getMessages, type Locale } from "@/lib/i18n"

export default async function LocalizedAdminSettingsPage(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params
  const session = await auth()
  const locale = params.locale as Locale
  const messages = getMessages(locale)

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{messages.admin.settingsTitle}</h1>
        <p className="text-muted-foreground">{messages.admin.settingsSubtitle}</p>
      </div>

      <SettingsPanel />

      <div className="my-8 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">{messages.admin.availabilityTitle || "Scheduling Availability"}</h2>
        <p className="text-muted-foreground mb-6">
          {messages.admin.availabilitySubtitle || "Manage your weekly working hours and blocked dates."}
        </p>
        <AvailabilitySettings />
      </div>
    </div>
  )
}
