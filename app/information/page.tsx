import { BackButton } from "@/components/ui/back-button"
import CenterInformation from "@/components/information/center-information"
import { getMessages } from "@/lib/i18n"

export default function InformationPage() {
  const messages = getMessages("en")
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton href="/dashboard" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{messages.information.title}</h1>
        </div>
        <p className="text-muted-foreground">
          {messages.information.subtitle}
        </p>
      </div>

      <CenterInformation />
    </div>
  )
}
