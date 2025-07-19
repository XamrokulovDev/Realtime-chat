import mongoose from "mongoose"

// Test uchun yangi muhit o'zgaruvchisi
const TEST_VAR = process.env.TEST_ENV_VARIABLE
console.log("TEST_ENV_VARIABLE loaded:", TEST_VAR ? TEST_VAR : "Undefined") // <-- Bu qatorni qo'shing

const MONGODB_URI = process.env.MONGODB_URI

console.log("MONGODB_URI loaded:", MONGODB_URI ? "Defined" : "Undefined")

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

const cached = global as typeof global & {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.mongoose.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose
    })
  }
  cached.mongoose.conn = await cached.mongoose.promise
  return cached.mongoose.conn
}

export default dbConnect
