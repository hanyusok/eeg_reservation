"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BackButtonProps {
  href?: string
  label?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function BackButton({
  href,
  label = "Back",
  variant = "outline",
  size = "default",
  className,
}: BackButtonProps) {
  const router = useRouter()

  if (href) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link href={href}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {label}
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
      {label}
    </Button>
  )
}
