"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Search } from "lucide-react"
import SignOutButton from "@/components/sign-out-button" // SignOutButton import qilindi
import ChatMessage from "@/components/chat-message"
import UserList from "@/components/user-list"
import { useToast } from "@/hooks/use-toast"
import type { ClientMessage, ClientUser } from "@/types/app-types" // Yangi turlar import qilindi

interface GlobalChatClientProps {
  initialMessages: ClientMessage[] // Tur ClientMessage[] ga o'zgartirildi
  initialUsers: ClientUser[] // Tur ClientUser[] ga o'zgartirildi
  currentUserId: string
}

export default function GlobalChatClient({ initialMessages, initialUsers, currentUserId }: GlobalChatClientProps) {
  const [messages, setMessages] = useState<ClientMessage[]>(initialMessages) // useState turlari aniqlandi
  const [newMessage, setNewMessage] = useState("")
  const [users, setUsers] = useState<ClientUser[]>(initialUsers) // useState turlari aniqlandi
  const [searchTerm, setSearchTerm] = useState("") // Qidiruv maydoni uchun state
  const [isAtBottom, setIsAtBottom] = useState(true) // isUserAtBottom o'rniga isAtBottom
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null) // messagesContainerRef o'rniga chatContainerRef

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

  // Xabarlarni va foydalanuvchilarni yangilash uchun polling
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const [messagesRes, usersRes] = await Promise.all([fetch("/api/messages/global"), fetch("/api/users")])

        if (messagesRes.ok) {
          const newMessages: ClientMessage[] = await messagesRes.json()
          setMessages(newMessages)
        }
        if (usersRes.ok) {
          const newUsers: ClientUser[] = await usersRes.json()
          setUsers(newUsers)
        }
      } catch (error) {
        console.error("Failed to fetch updates:", error)
      }
    }

    const interval = setInterval(fetchUpdates, 5000) // har 5 sekund
    return () => clearInterval(interval)
  }, [])

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

      const data: ClientMessage = await response.json() // Type berildi

      if (!response.ok) {
        toast({
          title: "Xatolik",
          description: data.content || "Xabar yuborishda xatolik yuz berdi.", // data.message o'rniga data.content bo'lishi mumkin
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

  const filteredUsers = users.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <main className="flex-1 flex">
      {/* Chat Area */}
      <Card className="flex-1 flex flex-col bg-zinc-900 border-none rounded-none">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex items-center justify-between space-y-2">
            <CardTitle className="text-xl">Global Chat</CardTitle>
            <SignOutButton />
          </div>
        </CardHeader>
        <CardContent ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto flex flex-col space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-zinc-500 mt-10">
              Global chatga xush kelibsiz! Bu yerda barcha foydalanuvchilar bilan suhbatlashishingiz mumkin.
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg._id} message={msg} isCurrentUser={msg.sender._id === currentUserId} />
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

      {/* User List Sidebar */}
      <aside className="w-64 bg-zinc-900 border-l border-zinc-800 p-4 flex flex-col">
        <h3 className="text-xl font-bold mb-4">Foydalanuvchilar</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Foydalanuvchilarni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <UserList users={filteredUsers} currentUserId={currentUserId} />
      </aside>
    </main>
  )
}