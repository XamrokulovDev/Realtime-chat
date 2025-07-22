"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function SignOutButton() {
  return (
  <LogOut onClick={() => signOut({ callbackUrl: "/login" })} size={32} className="cursor-pointer"/>
  )
}