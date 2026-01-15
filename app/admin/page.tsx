import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin/admin-dashboard"
import { getMessages } from "@/lib/i18n"

export default async function AdminPage() {
  const session = await auth()
  const messages = getMessages("en")

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role !== "admin" && session.user.role !== "doctor") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{messages.admin.title}</h1>
        <p className="text-muted-foreground">
          {messages.dashboard.welcomePrefix} {session.user.name || session.user.email}
        </p>
      </div>

      <AdminDashboard />
    </div>
  )
}

