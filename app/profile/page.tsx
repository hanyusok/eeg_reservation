import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "@/components/profile/profile-form"
import { BackButton } from "@/components/ui/back-button"
import { getMessages } from "@/lib/i18n"

export default async function ProfilePage() {
  const session = await auth()
  const messages = getMessages("en")

  if (!session) {
    redirect("/auth/login")
  }

  // Get user data from database
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!userData) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton href="/dashboard" />
        </div>
        <h1 className="text-3xl font-bold">{messages.profile.title}</h1>
        <p className="text-muted-foreground mt-2">
          {messages.profile.subtitle}
        </p>
      </div>

      <ProfileForm initialData={userData} />
    </div>
  )
}
