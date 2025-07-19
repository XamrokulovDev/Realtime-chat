"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-30 bg-red-600 hover:bg-red-700 text-white"
    >
      Chiqish
    </Button>
  )
}
