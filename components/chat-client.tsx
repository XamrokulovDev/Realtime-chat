"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import ChatMessage from "@/components/chat-message"
import { useToast } from "@/hooks/use-toast"
import type { IMessage } from "@/models/Message"
import type { IUser } from "@/models/User"
import type { IChat } from "@/models/Chat"

interface ChatClientProps {
  chat: IChat & { participants: IUser[] }
  initialMessages: (IMessage & { sender: IUser })[]
  currentUserId: string
}

export default function ChatClient({ chat, initialMessages, currentUserId }: ChatClientProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer
      const atBottom = scrollHeight - scrollTop <= clientHeight + 10
      setIsAtBottom(atBottom)
    }

    chatContainer.addEventListener("scroll", handleScroll)
    return () => chatContainer.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
    }
  }, [messages, isAtBottom])

  // Xabarlarni yangilash uchun polling
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${chat._id}`)
        if (response.ok) {
          const newMessages = await response.json()
          setMessages(newMessages)
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      }
    }

    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [chat._id])

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") {
      toast({
        title: "Xatolik",
        description: "Xabar matni bo'sh bo'lishi mumkin emas.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/messages/${chat._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Xatolik",
          description: data.message || "Xabar yuborishda xatolik yuz berdi.",
          variant: "destructive",
        })
      } else {
        setMessages((prevMessages) => [...prevMessages, data])
        setNewMessage("")
        scrollToBottom()
      }
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Tarmoq xatosi. Iltimos, keyinroq urinib ko‘ring.",
        variant: "destructive",
      })
    }
  }

  const chatTitle = chat.isGroupChat
    ? chat.name || "Nomsiz Guruh"
    : chat.participants.find((p) => p._id !== currentUserId)?.username || "Noma'lum Foydalanuvchi"

  return (
    <main className="flex-1 flex flex-col">
      <Card className="flex-1 flex flex-col bg-zinc-900 border-none rounded-none">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-xl">
            {chatTitle}
            {/* Profil linki olib tashlandi */}
          </CardTitle>
        </CardHeader>
        <CardContent ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto flex flex-col space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-zinc-500 mt-10">
              Bu chatda hali xabarlar yo'q. Birinchi bo'lib xabar yuboring!
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg._id} message={msg} isCurrentUser={msg.sender._id === currentUserId} />
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-4 border-t border-zinc-800 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Xabar yozing..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage()
              }
            }}
            className="flex-1 p-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </main>
  )
}