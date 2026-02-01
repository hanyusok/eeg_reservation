"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMessages } from "@/lib/i18n-client"

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    emailProvider: "console",
    smsProvider: "console",
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { messages } = useMessages()

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // In a real implementation, you'd save these to a database
      // For now, we'll just show a message
      setMessage(messages.settingsPanel.messages.saved)
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage(messages.settingsPanel.messages.failed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Configuration */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">
          {messages.settingsPanel.email.title}
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="emailProvider">
              {messages.settingsPanel.email.providerLabel}
            </Label>
            <select
              id="emailProvider"
              value={settings.emailProvider}
              onChange={(e) =>
                setSettings({ ...settings, emailProvider: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="console">{messages.settingsPanel.providers.console}</option>
              <option value="resend">{messages.settingsPanel.providers.resend}</option>
              <option value="sendgrid">{messages.settingsPanel.providers.sendgrid}</option>
              <option value="smtp">{messages.settingsPanel.providers.smtp}</option>
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              {messages.settingsPanel.email.providerHint}
            </p>
          </div>
        </div>
      </div>

      {/* SMS Configuration */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">
          {messages.settingsPanel.sms.title}
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="smsProvider">
              {messages.settingsPanel.sms.providerLabel}
            </Label>
            <select
              id="smsProvider"
              value={settings.smsProvider}
              onChange={(e) =>
                setSettings({ ...settings, smsProvider: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="console">{messages.settingsPanel.providers.console}</option>
              <option value="twilio">{messages.settingsPanel.providers.twilio}</option>
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              {messages.settingsPanel.sms.providerHint}
            </p>
          </div>
        </div>
      </div>



      {message && (
        <div
          className={`rounded-md p-3 ${message.includes(messages.settingsPanel.messages.failedPrefix)
            ? "bg-destructive/10 text-destructive"
            : "bg-green-100 text-green-800"
            }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? messages.settingsPanel.saving : messages.settingsPanel.save}
        </Button>
        <Button variant="outline" onClick={() => setMessage(null)}>
          {messages.common.cancel}
        </Button>
      </div>

      <div className="rounded-lg border bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          <strong>{messages.settingsPanel.noteTitle}</strong>{" "}
          {messages.settingsPanel.noteBody}
        </p>
      </div>
    </div>
  )
}


