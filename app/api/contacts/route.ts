import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import { User } from "@/models/index" // Modellar index.ts dan import qilindi
import mongoose from "mongoose"

// Foydalanuvchining kontaktlarini olish
export async function GET(req: Request) {
  await dbConnect()
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "Avtorizatsiya qilinmagan" }, { status: 401 })
  }

  try {
    const currentUser = await User.findById(session.user.id).populate(
      "contacts",
      "username isOnline lastSeen createdAt contacts email", // email qo'shildi
    )

    if (!currentUser) {
      return NextResponse.json({ message: "Foydalanuvchi topilmadi." }, { status: 404 })
    }

    // Ma'lumotlarni serializatsiya qilish
    const serializedContacts = currentUser.contacts.map((contact: any) => ({
      _id: contact._id.toString(),
      username: contact.username,
      email: contact.email,
      isOnline: contact.isOnline,
      lastSeen: contact.lastSeen?.toISOString(),
      createdAt: contact.createdAt?.toISOString(),
      contacts: contact.contacts?.map((c: any) => c.toString()) || [],
    }))

    return NextResponse.json(serializedContacts, { status: 200 })
  } catch (error: any) {
    console.error("Contacts fetch error:", error)
    return NextResponse.json({ message: "Kontaktlarni olishda xatolik yuz berdi." }, { status: 500 })
  }
}

// Kontakt qo'shish
export async function POST(req: Request) {
  await dbConnect()
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "Avtorizatsiya qilinmagan" }, { status: 401 })
  }

  try {
    const { targetUserId } = await req.json()

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ message: "Yaroqsiz foydalanuvchi IDsi." }, { status: 400 })
    }

    const currentUserId = session.user.id

    if (currentUserId === targetUserId) {
      return NextResponse.json({ message: "O'zingizni kontaktlaringizga qo'sha olmaysiz." }, { status: 400 })
    }

    const currentUser = await User.findById(currentUserId)
    const targetUser = await User.findById(targetUserId)

    if (!currentUser || !targetUser) {
      return NextResponse.json({ message: "Foydalanuvchi topilmadi." }, { status: 404 })
    }

    // Agar kontakt allaqachon mavjud bo'lsa
    if (currentUser.contacts.includes(targetUser._id)) {
      return NextResponse.json({ message: "Bu foydalanuvchi allaqachon kontaktlaringizda mavjud." }, { status: 409 })
    }

    // Kontaktni qo'shish
    currentUser.contacts.push(targetUser._id)
    await currentUser.save()

    return NextResponse.json({ message: "Kontakt muvaffaqiyatli qo'shildi." }, { status: 200 })
  } catch (error: any) {
    console.error("Add contact error:", error)
    return NextResponse.json({ message: error.message || "Kontakt qo'shishda xatolik yuz berdi." }, { status: 500 })
  }
}