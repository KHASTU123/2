import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import ChatMessage from "@/lib/models/ChatMessage"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await dbConnect()

    const messages = await ChatMessage.find({ userId: decoded.userId }).sort({ createdAt: -1 }).limit(50)

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error("Chat history error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}
