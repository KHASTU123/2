import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

// Extend global type for mongoose cache
declare global {
  var mongooseCache: {
    conn: mongoose.Connection | null
    promise: Promise<mongoose.Connection> | null
  }
}

let cached = (global as any).mongooseCache

if (!cached) {
  cached = (global as any).mongooseCache = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    console.log("Using existing MongoDB connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    }

    console.log("Creating new MongoDB connection...")
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully to:", mongoose.connection.db.databaseName)
        return mongoose.connection
      })
      .catch((error) => {
        console.error("❌ MongoDB connection failed:", error)
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("❌ MongoDB connection error:", e)
    throw e
  }

  return cached.conn
}

export default dbConnect
