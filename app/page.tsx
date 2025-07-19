"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Do nothing while loading

    if (!session) {
      router.push("/login")
    } else {
      router.push("/global") // Redirect to global chat if logged in
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return null // Will redirect, so no content needed here
}
