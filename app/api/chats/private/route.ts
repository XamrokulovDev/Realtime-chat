import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import { Chat } from "@/models/index" // Modellar index.ts dan import qilindi
import mongoose from "mongoose"

export async function POST(req: Request) {
  await dbConnect()
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "Avtorizatsiya qilinmagan" }, { status: 401 })
  }

  try {
    const { participant1Id, participant2Id } = await req.json()

    if (
      !participant1Id ||
      !mongoose.Types.ObjectId.isValid(participant1Id) ||
      !participant2Id ||
      !mongoose.Types.ObjectId.isValid(participant2Id)
    ) {
      return NextResponse.json(
        { message: "Ikkala ishtirokchi IDsi ham talab qilinadi va yaroqli bo'lishi kerak." },
        { status: 400 },
      )
    }

    // O'z-o'ziga chat qilishni oldini olish
    if (participant1Id === participant2Id) {
      return NextResponse.json({ message: "O'zingiz bilan chat qila olmaysiz." }, { status: 400 })
    }

    // Ishtirokchi IDlarini ObjectId ga aylantirish
    const p1ObjectId = new mongoose.Types.ObjectId(participant1Id)
    const p2ObjectId = new mongoose.Types.ObjectId(participant2Id)

    // Mavjud shaxsiy chatni topish
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [p1ObjectId, p2ObjectId], $size: 2 },
    })

    if (!chat) {
      // Agar chat mavjud bo'lmasa, yangisini yaratish
      chat = await Chat.create({
        isGroupChat: false,
        participants: [p1ObjectId, p2ObjectId],
      })
    }

    return NextResponse.json({ chatId: chat._id.toString() }, { status: 200 })
  } catch (error: any) {
    console.error("Private chat creation error:", error)
    return NextResponse.json({ message: error.message || "Chat yaratishda xatolik yuz berdi." }, { status: 500 })
  }
}