import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import { User } from "@/models/index" // Modellar index.ts dan import qilindi
import Link from "next/link"
import ContactsClient from "@/components/contacts-client"
import SignOutButton from "@/components/sign-out-button"
import type { ClientUser } from "@/types/app-types" // Yangi tur import qilindi

export default async function ContactsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  await dbConnect()

  // Joriy foydalanuvchining kontaktlarini olish
  const currentUser = await User.findById(session.user.id).populate(
    "contacts",
    "username isOnline lastSeen createdAt contacts email", // email qo'shildi
  )
  const initialContacts = currentUser ? currentUser.contacts : []

  // Barcha foydalanuvchilarni olish (qidiruv uchun)
  const allUsers = await User.find({}, "username isOnline lastSeen createdAt contacts email").sort({ username: 1 }) // email qo'shildi

  // Ma'lumotlarni serializatsiya qilish
  const serializedContacts: ClientUser[] = initialContacts.map((contact: any) => ({
    _id: contact._id.toString(),
    username: contact.username,
    email: contact.email,
    isOnline: contact.isOnline,
    lastSeen: contact.lastSeen?.toISOString(),
    createdAt: contact.createdAt?.toISOString(),
    contacts: contact.contacts?.map((c: any) => c.toString()) || [],
  }))

  const serializedAllUsers: ClientUser[] = allUsers.map((user: any) => ({
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen?.toISOString(),
    createdAt: user.createdAt?.toISOString(),
    contacts: user.contacts?.map((c: any) => c.toString()) || [],
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
          <Link href="/contacts" className="flex items-center p-2 rounded-md hover:bg-zinc-800 text-blue-500">
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

      {/* Main Content - Client Componentga o'tkazamiz */}
      <ContactsClient
        initialContacts={serializedContacts}
        allUsers={serializedAllUsers}
        currentUserId={session.user.id}
      />
    </div>
  )
}