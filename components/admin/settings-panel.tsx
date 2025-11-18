"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    zapierWebhookUrl: "",
    emailProvider: "console",
    smsProvider: "console",
    calendlyApiKey: "",
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // In a real implementation, you'd save these to a database
      // For now, we'll just show a message
      setMessage("Settings saved! (Note: In production, these would be stored securely)")
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Zapier Integration */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Zapier Integration</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="zapierWebhookUrl">Zapier Webhook URL</Label>
            <Input
              id="zapierWebhookUrl"
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={settings.zapierWebhookUrl}
              onChange={(e) =>
                setSettings({ ...settings, zapierWebhookUrl: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground mt-1">
              Get this URL from your Zapier webhook trigger
            </p>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="emailProvider">Email Provider</Label>
            <select
              id="emailProvider"
              value={settings.emailProvider}
              onChange={(e) =>
                setSettings({ ...settings, emailProvider: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="console">Console (Development)</option>
              <option value="resend">Resend</option>
              <option value="sendgrid">SendGrid</option>
              <option value="smtp">SMTP</option>
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              Configure email provider in environment variables
            </p>
          </div>
        </div>
      </div>

      {/* SMS Configuration */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">SMS Configuration</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="smsProvider">SMS Provider</Label>
            <select
              id="smsProvider"
              value={settings.smsProvider}
              onChange={(e) =>
                setSettings({ ...settings, smsProvider: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="console">Console (Development)</option>
              <option value="twilio">Twilio</option>
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              Configure SMS provider in environment variables
            </p>
          </div>
        </div>
      </div>

      {/* Calendly Configuration */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Calendly Integration</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="calendlyApiKey">Calendly API Key</Label>
            <Input
              id="calendlyApiKey"
              type="password"
              placeholder="Enter Calendly API key"
              value={settings.calendlyApiKey}
              onChange={(e) =>
                setSettings({ ...settings, calendlyApiKey: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground mt-1">
              Configure in environment variables for security
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 ${
            message.includes("Failed")
              ? "bg-destructive/10 text-destructive"
              : "bg-green-100 text-green-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="outline" onClick={() => setMessage(null)}>
          Cancel
        </Button>
      </div>

      <div className="rounded-lg border bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> For security, sensitive configuration like API keys should be
          stored in environment variables, not in the database. This UI is for display
          purposes only.
        </p>
      </div>
    </div>
  )
}


