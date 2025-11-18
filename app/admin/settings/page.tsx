import { auth } from "@/auth"
import { redirect } from "next/navigation"
import SettingsPanel from "@/components/admin/settings-panel"

export default async function AdminSettingsPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure integrations and system preferences
        </p>
      </div>

      <SettingsPanel />
    </div>
  )
}


