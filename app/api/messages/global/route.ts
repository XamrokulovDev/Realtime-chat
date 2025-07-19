import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import { Message, Chat } from "@/models/index" // Modellar index.ts dan import qilindi

// Global chat ID ni saqlash uchun (yoki uni dinamik topish)
let globalChatId: string | null = null

async function getOrCreateGlobalChatId() {
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

export async function GET(req: Request) {
  await dbConnect()
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "Avtorizatsiya qilinmagan" }, { status: 401 })
  }

  try {
    const globalChatObjectId = await getOrCreateGlobalChatId()

    const messages = await Message.find({ chat: globalChatObjectId })
      .populate("sender", "username isOnline lastSeen createdAt contacts email") // email qo'shildi
      .sort({ timestamp: 1 }) // Eng eski xabardan boshlab tartiblash
      .limit(50) // Oxirgi 50 ta xabarni olish

    // Ma'lumotlarni serializatsiya qilish
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
    console.error("Global messages fetch error:", error)
    return NextResponse.json({ message: "Xabarlarni olishda xatolik yuz berdi." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  await dbConnect()
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "Avtorizatsiya qilinmagan" }, { status: 401 })
  }

  try {
    const { content } = await req.json()
    const senderId = session.user.id

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ message: "Xabar matni bo'sh bo'lishi mumkin emas." }, { status: 400 })
    }

    const globalChatObjectId = await getOrCreateGlobalChatId()

    const newMessage = await Message.create({
      sender: senderId,
      chat: globalChatObjectId,
      content: content.trim(),
      contentType: "text", // Hozircha faqat text
    })

    // Chat modelidagi lastMessage ni yangilash
    await Chat.findByIdAndUpdate(globalChatObjectId, { lastMessage: newMessage._id, updatedAt: new Date() })

    // Xabarni yuboruvchi ma'lumotlari bilan qaytarish
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
    console.error("Global message send error:", error)
    return NextResponse.json({ message: error.message || "Xabar yuborishda xatolik yuz berdi." }, { status: 500 })
  }
}