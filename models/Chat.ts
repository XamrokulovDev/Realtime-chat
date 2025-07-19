import { Schema, models, model, type Document } from "mongoose"

export interface IChat extends Document {
  name?: string // Guruh chatlari uchun nom
  isGroupChat: boolean
  participants: Schema.Types.ObjectId[] // User modellarga bog'lanadi
  lastMessage?: Schema.Types.ObjectId // Oxirgi xabar
  createdAt: Date
  updatedAt: Date
}

const ChatSchema = new Schema<IChat>(
  {
    name: {
      type: String,
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // User modeliga bog'lanish
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message", // Message modeliga bog'lanish
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }, // createdAt va updatedAt ni avtomatik boshqarish
)

const Chat = models.Chat || model<IChat>("Chat", ChatSchema)

export default Chat
