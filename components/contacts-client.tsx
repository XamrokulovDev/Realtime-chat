"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react" // Dispatch va SetStateAction qo'shildi
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ClientUser } from "@/types/app-types" // ClientUser import qilindi
import { formatRelativeTime } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ContactsClientProps {
  initialContacts: ClientUser[] // Tur ClientUser[] ga o'zgartirildi
  allUsers: ClientUser[] // Tur ClientUser[] ga o'zgartirildi
  currentUserId: string
}

export default function ContactsClient({ initialContacts, allUsers, currentUserId }: ContactsClientProps) {
  const [contacts, setContacts] = useState<ClientUser[]>(initialContacts) // useState turlari aniqlandi
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<ClientUser[]>([]) // useState turlari aniqlandi
  const { toast } = useToast()
  const router = useRouter()

  // Qidiruv funksiyasi
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([])
      return
    }

    const filtered = allUsers.filter(
      (user) =>
        user._id !== currentUserId && // O'zini qidiruv natijalaridan chiqarish
        !contacts.some((contact) => contact._id === user._id) && // Allaqaon kontaktda bo'lganlarni chiqarish
        user.username.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setSearchResults(filtered)
  }, [searchTerm, allUsers, contacts, currentUserId])

  const handleAddContact = async (targetUserId: string) => {
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Xatolik",
          description: data.message || "Kontakt qo'shishda xatolik yuz berdi.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Muvaffaqiyatli!",
          description: data.message,
        })
        // Kontaktlar ro'yxatini yangilash
        const addedUser = allUsers.find((user) => user._id === targetUserId)
        if (addedUser) {
          setContacts((prev) => [...prev, addedUser])
          setSearchTerm("") // Qidiruv maydonini tozalash
          setSearchResults([]) // Qidiruv natijalarini tozalash
        }
      }
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Tarmoq xatosi. Iltimos, keyinroq urinib ko‘ring.",
        variant: "destructive",
      })
    }
  }

  const handleStartPrivateChat = async (targetUserId: string) => {
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
    }
  }

  return (
    <main className="flex-1 flex flex-col p-4">
      <Card className="flex-1 bg-zinc-900 border-zinc-800">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-xl">Kontaktlarim</CardTitle>
          <CardDescription className="text-zinc-400">
            Kontaktlaringizni boshqaring va yangi foydalanuvchilarni qidiring.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          {/* Kontakt qidirish */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Yangi kontakt qo'shish</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Foydalanuvchi nomi bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {searchTerm.trim() !== "" && searchResults.length > 0 && (
              <div className="bg-zinc-800 rounded-md p-3 max-h-60 overflow-y-auto">
                <h4 className="text-md font-medium mb-2">Qidiruv natijalari:</h4>
                <ul className="space-y-2">
                  {searchResults.map((user) => (
                    <li key={user._id} className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.username}</p>
                          <p className="text-xs text-zinc-400">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddContact(user._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <UserPlus className="h-4 w-4 mr-1" /> Qo'shish
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {searchTerm.trim() !== "" && searchResults.length === 0 && (
              <p className="text-center text-zinc-500">Foydalanuvchi topilmadi.</p>
            )}
          </div>

          {/* Mavjud kontaktlar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mening kontaktlarim ({contacts.length})</h3>
            {contacts.length === 0 ? (
              <p className="text-center text-zinc-500">Sizda hali kontaktlar yo'q.</p>
            ) : (
              <ul className="space-y-2">
                {contacts.map((user) => (
                  <li key={user._id} className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-zinc-900 ${
                            user.isOnline ? "bg-green-500" : "bg-gray-500"
                          }`}
                          title={
                            user.isOnline
                              ? "Onlayn"
                              : `Oxirgi ko'rilgan: ${formatRelativeTime(new Date(user.lastSeen))}`
                          }
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.username}</p>
                        <p className="text-xs text-zinc-400">
                          {user.isOnline
                            ? "Onlayn"
                            : `Oxirgi ko'rilgan: ${formatRelativeTime(new Date(user.lastSeen))}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartPrivateChat(user._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" /> Chat
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}