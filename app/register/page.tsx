"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Ro‘yxatdan o‘tishda xatolik yuz berdi.")
        toast({
          title: "Xatolik",
          description: data.message || "Ro‘yxatdan o‘tishda xatolik yuz berdi.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Muvaffaqiyatli!",
          description: "Ro‘yxatdan o‘tdingiz. Endi tizimga kirishingiz mumkin.",
        })
        router.push("/login")
      }
    } catch (err) {
      setError("Tarmoq xatosi. Iltimos, keyinroq urinib ko‘ring.")
      toast({
        title: "Xatolik",
        description: "Tarmoq xatosi. Iltimos, keyinroq urinib ko‘ring.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Ro‘yxatdan o‘tish</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                id="username"
                type="text"
                placeholder="Foydalanuvchi nomi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Yuklanmoqda..." : "Ro‘yxatdan o‘tish"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-400">
            Hisobingiz bormi?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Tizimga kirish
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
