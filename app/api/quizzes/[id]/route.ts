import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Quiz from "@/lib/models/Quiz"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const quiz = await Quiz.findById(params.id).populate("createdBy", "name")

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json({ quiz }, { status: 200 })
  } catch (error) {
    console.error("Quiz fetch error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}
