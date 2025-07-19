import type { DefaultSession, DefaultJWT } from "next-auth"

// NextAuth.js ning Session va JWT turlarini kengaytirish
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      email: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    username: string
    email: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    username: string
    email: string
  }
}
