// Mijoz tomonida ishlatiladigan foydalanuvchi turi
export interface ClientUser {
  _id: string // ObjectId stringga aylanadi
  username: string
  email: string
  isOnline: boolean
  lastSeen: string // Date stringga aylanadi (ISO format)
  createdAt: string // Date stringga aylanadi (ISO format)
  contacts: string[] // ObjectId[] string[] ga aylanadi
}

// Mijoz tomonida ishlatiladigan xabar turi
export interface ClientMessage {
  _id: string // ObjectId stringga aylanadi
  sender: ClientUser // Yuboruvchi ClientUser turi bo'ladi
  chat: string // ObjectId stringga aylanadi
  content: string
  contentType: "text" | "image" | "sticker" | "gif" | "audio"
  timestamp: string // Date stringga aylanadi (ISO format)
}

// Mijoz tomonida ishlatiladigan chat turi
export interface ClientChat {
  _id: string // ObjectId stringga aylanadi
  name?: string
  isGroupChat: boolean
  participants: ClientUser[] // Ishtirokchilar ClientUser[] turi bo'ladi
  lastMessage?: string // ObjectId stringga aylanadi
  createdAt: string // Date stringga aylanadi (ISO format)
  updatedAt: string // Date stringga aylanadi (ISO format)
}