import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import { User } from "@/models/index" // Modellar index.ts dan import qilindi
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import StartPrivateChatButton from "@/components/start-private-chat-button"
import mongoose from "mongoose"
import type { ClientUser } from "@/types/app-types" // Yangi tur import qilindi

interface UserProfilePageProps {
  params: {
    userId: string
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await dbConnect()

  let user: ClientUser | null = null
  const profileId = params.userId

  if (profileId === "me") {
    // Agar foydalanuvchi o'z profilini ko'rmoqchi bo'lsa
    const serverUser = await User.findById(session.user.id)
    if (serverUser) {
      user = {
        _id: serverUser._id.toString(),
        username: serverUser.username,
        email: serverUser.email,
        isOnline: serverUser.isOnline,
        lastSeen: serverUser.lastSeen?.toISOString(),
        createdAt: serverUser.createdAt?.toISOString(),
        contacts: serverUser.contacts?.map((c) => c.toString()) || [],
      }
    }
  } else {
    // Agar boshqa foydalanuvchining profilini ko'rmoqchi bo'lsa
    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Foydalanuvchi topilmadi</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-zinc-400">
              Siz qidirayotgan foydalanuvchi mavjud emas.
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
    const serverUser = await User.findById(profileId)
    if (serverUser) {
      user = {
        _id: serverUser._id.toString(),
        username: serverUser.username,
        email: serverUser.email,
        isOnline: serverUser.isOnline,
        lastSeen: serverUser.lastSeen?.toISOString(),
        createdAt: serverUser.createdAt?.toISOString(),
        contacts: serverUser.contacts?.map((c) => c.toString()) || [],
      }
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Foydalanuvchi topilmadi</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-zinc-400">
            Siz qidirayotgan foydalanuvchi mavjud emas.
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

  const isCurrentUser = user._id === session.user.id

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1 text-center">
          <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl font-bold mx-auto mb-4">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <CardTitle className="text-3xl">
            {user.username} {isCurrentUser && "(Siz)"}
          </CardTitle>
          <CardDescription className="text-zinc-400">{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg">
              Holat:{" "}
              <span className={`font-semibold ${user.isOnline ? "text-green-500" : "text-gray-500"}`}>
                {user.isOnline ? "Onlayn" : "Oflayn"}
              </span>
            </p>
            {!user.isOnline && (
              <p className="text-sm text-zinc-400">
                Oxirgi ko'rilgan:{" "}
                {new Date(user.lastSeen).toLocaleString("uz-UZ", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-4">
            {!isCurrentUser && <StartPrivateChatButton targetUserId={user._id} currentUserId={session.user.id} />}
            {isCurrentUser && null}
          </div>
          <div className="mt-6 text-center">
            <Link href="/global">
              <Button variant="outline" className="text-blue-500 border-blue-500 hover:bg-blue-900 bg-transparent">
                Global chatga qaytish
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}