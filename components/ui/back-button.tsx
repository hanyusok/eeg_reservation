"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useMessages } from "@/lib/i18n-client"

interface BackButtonProps {
  href?: string
  label?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function BackButton({
  href,
  label,
  variant = "outline",
  size = "default",
  className,
}: BackButtonProps) {
  const router = useRouter()
  const { messages } = useMessages()
  const buttonLabel = label || messages.common.back

  if (href) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link href={href}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {buttonLabel}
        </Link>
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => router.back()}
      className={className}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {buttonLabel}
    </Button>
  )
}
