"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import ChatMessage from "@/components/chat-message"
import UserList from "@/components/user-list"
import { useToast } from "@/hooks/use-toast"
import type { IMessage } from "@/models/Message"
import type { IUser } from "@/models/User"

interface GlobalChatClientProps {
  initialMessages: (IMessage & { sender: IUser })[]
  initialUsers: IUser[]
  currentUserId: string
}

export default function GlobalChatClient({
  initialMessages,
  initialUsers,
  currentUserId,
}: GlobalChatClientProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [users, setUsers] = useState(initialUsers)
  const [isUserAtBottom, setIsUserAtBottom] = useState(true)

  const { toast } = useToast()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (isUserAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50

    setIsUserAtBottom(isAtBottom)
  }

  // Polling bilan har 1 sekundda yangilash
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const [messagesRes, usersRes] = await Promise.all([
          fetch("/api/messages/global"),
          fetch("/api/users"),
        ])

        if (messagesRes.ok) {
          const newMessages = await messagesRes.json()
          setMessages(newMessages)
        }

        if (usersRes.ok) {
          const newUsers = await usersRes.json()
          setUsers(newUsers)
        }
      } catch (error) {
        console.error("Failed to fetch updates:", error)
      }
    }

    const interval = setInterval(fetchUpdates, 1000) // har 1 sekund
    return () => clearInterval(interval)
  }, [])

  // scroll faqat kerak bo‘lsa
  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      const response = await fetch("/api/messages/global", {
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

  return (
    <main className="flex-1 flex">
      {/* Chat Area */}
      <Card className="flex-1 flex flex-col bg-zinc-900 border-none rounded-none">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-xl">Global Chat</CardTitle>
        </CardHeader>

        <CardContent
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-4 overflow-y-auto flex flex-col space-y-2"
        >
          {messages.length === 0 ? (
            <div className="text-center text-zinc-500 mt-10">
              Global chatga xush kelibsiz!
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                message={msg}
                isCurrentUser={msg.sender._id === currentUserId}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input area */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Xabar yozing..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
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

      {/* User List Sidebar */}
      <aside className="w-64 bg-zinc-900 border-l border-zinc-800 p-4 flex flex-col">
        <h3 className="text-xl font-bold mb-4">Foydalanuvchilar</h3>
        <UserList users={users} currentUserId={currentUserId} />
      </aside>
    </main>
  )
}