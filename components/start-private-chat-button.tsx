"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface StartPrivateChatButtonProps {
  targetUserId: string
  currentUserId: string
}

export default function StartPrivateChatButton({ targetUserId, currentUserId }: StartPrivateChatButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleStartChat = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/chats/private", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participant1Id: currentUserId, participant2Id: targetUserId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Xatolik",
          description: data.message || "Chat yaratishda xatolik yuz berdi.",
          variant: "destructive",
        })
      } else {
        router.push(`/chat/${data.chatId}`)
      }
    } catch (error) {
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
    <Button onClick={handleStartChat} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
      <MessageCircle className="h-5 w-5 mr-2" /> {loading ? "Yuklanmoqda..." : "Xabar yuborish"}
    </Button>
  )
}