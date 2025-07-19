import { CardContent } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import { Chat, Message } from "@/models/index" // Modellar index.ts dan import qilindi
import ChatClient from "@/components/chat-client"
import SignOutButton from "@/components/sign-out-button"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ClientChat, ClientMessage, ClientUser } from "@/types/app-types" // Yangi turlar import qilindi

interface ChatPageProps {
  params: {
    chatId: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await dbConnect()

  const chat = await Chat.findById(params.chatId).populate(
    "participants",
    "username isOnline lastSeen createdAt contacts email", // email qo'shildi
  )

  if (!chat) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Chat topilmadi</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-zinc-400">
            Siz qidirayotgan chat mavjud emas yoki sizda unga kirish huquqi yo'q.
            <div className="mt-4">
              <Link href="/global">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Global chatga qaytish</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Foydalanuvchi chat ishtirokchisi ekanligini tekshirish
  const isParticipant = chat.participants.some((p: any) => p._id.toString() === session.user.id)

  if (!isParticipant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Kirish rad etildi</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-zinc-400">
            Sizda ushbu chatga kirish huquqi yo'q.
            <div className="mt-4">
              <Link href="/global">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Global chatga qaytish</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initialMessages = await Message.find({ chat: chat._id })
    .populate("sender", "username isOnline lastSeen createdAt contacts email") // email qo'shildi
    .sort({ timestamp: 1 })
    .limit(50)

  // Ma'lumotlarni serializatsiya qilish
  const serializedChat: ClientChat = {
    _id: chat._id.toString(),
    name: chat.name,
    isGroupChat: chat.isGroupChat,
    participants: chat.participants.map(
      (p: any): ClientUser => ({
        _id: p._id.toString(),
        username: p.username,
        email: p.email,
        isOnline: p.isOnline,
        lastSeen: p.lastSeen?.toISOString(),
        createdAt: p.createdAt?.toISOString(),
        contacts: p.contacts?.map((c: any) => c.toString()) || [],
      }),
    ),
    lastMessage: chat.lastMessage?.toString(),
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  }

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
          <Link href="/global" className="flex items-center p-2 rounded-md hover:bg-zinc-800">
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
      <ChatClient chat={serializedChat} initialMessages={serializedMessages} currentUserId={session.user.id} />
    </div>
  )
}