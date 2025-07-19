import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "./mongodb"
import User from "../models/User"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect()

        const { usernameOrEmail, password } = credentials as any

        const user = await User.findOne({
          $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        })

        console.log("Attempting to log in with:", usernameOrEmail)
        console.log("Found user:", user ? user.username : "No user found")

        if (!user) {
          throw new Error("Noto‘g‘ri parol yoki foydalanuvchi nomi")
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
        console.log("Password comparison result:", isPasswordValid)

        if (!isPasswordValid) {
          throw new Error("Noto‘g‘ri parol yoki foydalanuvchi nomi")
        }

        // Update user's online status
        await User.findByIdAndUpdate(user._id, { isOnline: true, lastSeen: new Date() })

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login page on error
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  events: {
    async signOut({ token }) {
      if (token.id) {
        await dbConnect()
        await User.findByIdAndUpdate(token.id, { isOnline: false, lastSeen: new Date() })
      }
    },
  },
}
