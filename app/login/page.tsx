"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      redirect: false,
      usernameOrEmail,
      password,
    })

    if (result?.error) {
      setError(result.error)
      toast({
        title: "Xatolik",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Muvaffaqiyatli!",
        description: "Tizimga muvaffaqiyatli kirdingiz.",
      })
      router.push("/global") // Redirect to global chat after successful login
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Tizimga kirish</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Foydalanuvchi nomi yoki Email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Input
                id="password"
                type="password"
                placeholder="Parol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Yuklanmoqda..." : "Kirish"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-400">
            Hisobingiz yo‘qmi?{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              Ro‘yxatdan o‘tish
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
