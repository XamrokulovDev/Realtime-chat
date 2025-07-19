import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import { User } from "@/models/index" // Modellar index.ts dan import qilindi

export async function GET(req: Request) {
  await dbConnect()
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "Avtorizatsiya qilinmagan" }, { status: 401 })
  }

  try {
    const users = await User.find({}, "username isOnline lastSeen createdAt contacts email").sort({ username: 1 }) // email qo'shildi
    // Date obyektlarini stringga aylantirish
    const serializedUsers = users.map((user: any) => ({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen?.toISOString(),
      createdAt: user.createdAt?.toISOString(),
      contacts: user.contacts?.map((c: any) => c.toString()) || [],
    }))
    return NextResponse.json(serializedUsers, { status: 200 })
  } catch (error: any) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ message: "Foydalanuvchilarni olishda xatolik yuz berdi." }, { status: 500 })
  }
}