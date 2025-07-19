import { Schema, models, model, type Document } from "mongoose"

export interface IMessage extends Document {
  sender: Schema.Types.ObjectId // User modeliga bog'lanadi
  chat: Schema.Types.ObjectId // Chat modeliga bog'lanadi
  content: string
  contentType: "text" | "image" | "sticker" | "gif" | "audio"
  timestamp: Date
}

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User", // User modeliga bog'lanish
    required: true,
  },
  chat: {
    type: Schema.Types.ObjectId,
    ref: "Chat", // Chat modeliga bog'lanish
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    enum: ["text", "image", "sticker", "gif", "audio"],
    default: "text",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const Message = models.Message || model<IMessage>("Message", MessageSchema)

export default Message
