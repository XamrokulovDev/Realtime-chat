import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import { Message, Chat } from "@/models/index" // Modellar index.ts dan import qilindi
import mongoose from "mongoose"

export async function GET(req: Request, { params }: { params: { chatId: string } }) {
  await dbConnect()
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "Avtorizatsiya qilinmagan" }, { status: 401 })
  }

  try {
    const chatId = params.chatId

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ message: "Yaroqsiz chat ID." }, { status: 400 })
    }

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return NextResponse.json({ message: "Chat topilmadi." }, { status: 404 })
    }

    // Foydalanuvchi chat ishtirokchisi ekanligini tekshirish
    const isParticipant = chat.participants.some((pId: mongoose.Types.ObjectId) => pId.toString() === session.user.id)
    if (!isParticipant) {
      return NextResponse.json({ message: "Sizda ushbu chatga kirish huquqi yo'q." }, { status: 403 })
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username isOnline lastSeen createdAt contacts email") // email qo'shildi
      .sort({ timestamp: 1 })
      .limit(50)

    // Date obyektlarini stringga aylantirish
    const serializedMessages = messages.map((message: any) => ({
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

    return NextResponse.json(serializedMessages, { status: 200 })
  } catch (error: any) {
    console.error("Messages fetch error:", error)
    return NextResponse.json({ message: "Xabarlarni olishda xatolik yuz berdi." }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { chatId: string } }) {
  await dbConnect()
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "Avtorizatsiya qilinmagan" }, { status: 401 })
  }

  try {
    const chatId = params.chatId
    const { content } = await req.json()
    const senderId = session.user.id

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ message: "Yaroqsiz chat ID." }, { status: 400 })
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ message: "Xabar matni bo'sh bo'lishi mumkin emas." }, { status: 400 })
    }

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return NextResponse.json({ message: "Chat topilmadi." }, { status: 404 })
    }

    // Foydalanuvchi chat ishtirokchisi ekanligini tekshirish
    const isParticipant = chat.participants.some((pId: mongoose.Types.ObjectId) => pId.toString() === session.user.id)
    if (!isParticipant) {
      return NextResponse.json({ message: "Sizda ushbu chatga xabar yuborish huquqi yo'q." }, { status: 403 })
    }

    const newMessage = await Message.create({
      sender: senderId,
      chat: chatId,
      content: content.trim(),
      contentType: "text",
    })

    await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id, updatedAt: new Date() })

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "username isOnline lastSeen createdAt contacts email", // email qo'shildi
    )

    // Ma'lumotlarni serializatsiya qilish
    const serializedMessage = {
      _id: populatedMessage._id.toString(),
      sender: {
        _id: populatedMessage.sender._id.toString(),
        username: populatedMessage.sender.username,
        email: populatedMessage.sender.email,
        isOnline: populatedMessage.sender.isOnline,
        lastSeen: populatedMessage.sender.lastSeen?.toISOString(),
        createdAt: populatedMessage.sender.createdAt?.toISOString(),
        contacts: populatedMessage.sender.contacts?.map((c: any) => c.toString()) || [],
      },
      chat: populatedMessage.chat.toString(),
      content: populatedMessage.content,
      contentType: populatedMessage.contentType,
      timestamp: populatedMessage.timestamp.toISOString(),
    }

    return NextResponse.json(serializedMessage, { status: 201 })
  } catch (error: any) {
    console.error("Message send error:", error)
    return NextResponse.json({ message: error.message || "Xabar yuborishda xatolik yuz berdi." }, { status: 500 })
  }
}