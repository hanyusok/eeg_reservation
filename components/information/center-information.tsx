"use client"

import {
  MapPin,
  Clock,
  Users,
  FileText,
  Phone,
  Mail,
  Building2,
} from "lucide-react"
import { useMessages } from "@/lib/i18n-client"

export default function CenterInformation() {
  const { messages } = useMessages()
  const info = messages.informationCenter

  return (
    <div className="space-y-6">
      {/* Location Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-primary/10 p-2">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{info.location.title}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {info.location.addressLabel}
            </p>
            <p className="text-lg">
              {info.location.addressLines.map((line: string, index: number) => (
                <span key={line}>
                  {line}
                  {index < info.location.addressLines.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {info.location.phoneLabel}
              </p>
              <p className="text-sm">{info.location.phoneValue}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {info.location.emailLabel}
              </p>
              <p className="text-sm">{info.location.emailValue}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>{info.location.transitLabel}</strong> {info.location.transitText}
              <br />
              <strong>{info.location.parkingLabel}</strong> {info.location.parkingText}
            </p>
          </div>
        </div>
      </div>

      {/* Operating Hours Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-primary/10 p-2">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{info.hours.title}</h2>
        </div>
        <div className="space-y-3">
          {info.hours.schedule.map((item: any) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">{item.time}</span>
            </div>
          ))}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md">
            <p className="text-sm">
              <strong>{info.hours.emergencyTitle}</strong> {info.hours.emergencyText}
              <br />
              <span className="text-muted-foreground">{info.hours.emergencyHotline}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Staff Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-primary/10 p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{info.staff.title}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {info.staff.members.map((member: any) => (
            <div key={member.name} className="p-4 border rounded-md">
              <h3 className="font-semibold mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
              <p className="text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* EEG Preparation Instructions Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-primary/10 p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{info.preparation.title}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-lg">
              {info.preparation.before.title}
            </h3>
            <ul className="space-y-2 text-sm">
              {info.preparation.before.items.map((item: any) => (
                <li key={item.title} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>{item.title}</strong> {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-lg">
              {info.preparation.dayOf.title}
            </h3>
            <ul className="space-y-2 text-sm">
              {info.preparation.dayOf.items.map((item: any) => (
                <li key={item.title} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    <strong>{item.title}</strong> {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-lg">
              {info.preparation.during.title}
            </h3>
            <ul className="space-y-2 text-sm">
              {info.preparation.during.items.map((text: string) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-900">
            <p className="text-sm font-semibold mb-1">
              {info.preparation.notice.title}
            </p>
            <p className="text-sm">{info.preparation.notice.body}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
