import { Schema, models, model, type Document } from "mongoose"

export interface IUser extends Document {
  username: string
  email: string
  passwordHash: string
  isOnline: boolean
  lastSeen: Date
  createdAt: Date
  contacts: Schema.Types.ObjectId[] // Yangi maydon: foydalanuvchi kontaktlari
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters long"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please fill a valid email address"],
  },
  passwordHash: {
    type: String,
    required: [true, "Password is required"],
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  contacts: [
    {
      type: Schema.Types.ObjectId,
      ref: "User", // User modeliga bog'lanish
    },
  ],
})

// Agar model allaqachon mavjud bo'lsa, uni qayta aniqlashdan oldin o'chiramiz
// Bu development muhitida hot reloading bilan bog'liq muammolarni hal qiladi
if (models.User) {
  delete models.User
}

const User = models.User || model<IUser>("User", UserSchema)

export default User