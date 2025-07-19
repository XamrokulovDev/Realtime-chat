// "use client" direktivasini olib tashlaymiz, bu uni Server Component ga aylantiradi
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import { User, Message, Chat } from "@/models/index" // Modellar index.ts dan import qilindi
import GlobalChatClient from "@/components/global-chat-client"
import SignOutButton from "@/components/sign-out-button"
import Link from "next/link"
import type { ClientUser, ClientMessage } from "@/types/app-types" // Yangi turlar import qilindi

// Global chat ID ni saqlash uchun (yoki uni dinamik topish)
let globalChatId: string | null = null

async function getOrCreateGlobalChatIdServer() {
  if (globalChatId) {
    return globalChatId
  }

  await dbConnect()
  let globalChat = await Chat.findOne({ name: "Global Chat", isGroupChat: true })

  if (!globalChat) {
    // Agar global chat mavjud bo'lmasa, uni yaratamiz
    globalChat = await Chat.create({
      name: "Global Chat",
      isGroupChat: true,
      participants: [], // Barcha foydalanuvchilar avtomatik qo'shiladi
    })
  }
  globalChatId = globalChat._id.toString()
  return globalChatId
}

export default async function GlobalChatPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await dbConnect()

  // Barcha foydalanuvchilarni olish
  const users = await User.find({}, "username isOnline lastSeen createdAt contacts email").sort({ username: 1 }) // email qo'shildi

  // Global chat xabarlarini olish
  const globalChatObjectId = await getOrCreateGlobalChatIdServer()
  const initialMessages = await Message.find({ chat: globalChatObjectId })
    .populate("sender", "username isOnline lastSeen createdAt contacts email") // email qo'shildi
    .sort({ timestamp: 1 })
    .limit(50)

  // Ma'lumotlarni serializatsiya qilish (Date obyektlarini stringga aylantirish)
  const serializedUsers: ClientUser[] = users.map((user: any) => ({
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen?.toISOString(),
    createdAt: user.createdAt?.toISOString(),
    contacts: user.contacts?.map((c: any) => c.toString()) || [],
  }))

  const serializedMessages: ClientMessage[] = initialMessages.map((message: any) => ({
    _id: message._id.toString(),
    sender: {
      _id: message.sender._id.toString(),
      username: message.sender.username,
      email: message.sender.email,
      isOnline: message.sender.isOnline,
      lastSeen: message.sender.lastSeen?.toISOString(),
      createdAt: message.sender.createdAt?.toISOString(),
      contacts: message.sender.contacts?.map((c: any) => c.toString()) || [],
    },
    chat: message.chat.toString(),
    content: message.content,
    contentType: message.contentType,
    timestamp: message.timestamp.toISOString(),
  }))

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-blue-500">Global Chat</h2>
        <nav className="space-y-2">
          <Link href="/global" className="flex items-center p-2 rounded-md hover:bg-zinc-800 text-blue-500">
            Global Chat
          </Link>
          <Link href="/contacts" className="flex items-center p-2 rounded-md hover:bg-zinc-800">
            Kontaktlarim
          </Link>
          <Link href="/settings" className="flex items-center p-2 rounded-md hover:bg-zinc-800">
            Sozlamalar
          </Link>
        </nav>
        <div className="mt-auto">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Chat Area - Client Componentga o'tkazamiz */}
      <GlobalChatClient
        initialMessages={serializedMessages}
        initialUsers={serializedUsers}
        currentUserId={session.user.id}
      />
    </div>
  )
}