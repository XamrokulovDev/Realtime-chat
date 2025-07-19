import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  await dbConnect()

  try {
    const { username, email, password } = await req.json()

    // Check if username already exists
    const existingUserByUsername = await User.findOne({ username })
    if (existingUserByUsername) {
      return NextResponse.json({ message: "Bu username allaqachon band." }, { status: 409 })
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email })
    if (existingUserByEmail) {
      return NextResponse.json({ message: "Bu email allaqachon ro‘yxatdan o‘tgan." }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      username,
      email,
      passwordHash,
      isOnline: false,
      lastSeen: new Date(),
    })

    return NextResponse.json(
      { message: "Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi.", user: newUser },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: error.message || "Ro‘yxatdan o‘tishda xatolik yuz berdi." }, { status: 500 })
  }
}
