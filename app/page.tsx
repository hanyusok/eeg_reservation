import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          EEG Reservation System
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Online reservation system for pediatric epilepsy EEG monitoring
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

