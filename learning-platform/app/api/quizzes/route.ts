import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Quiz from "@/lib/models/Quiz"
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

    const quizzes = await Quiz.find({ isActive: true }).populate("createdBy", "name").sort({ createdAt: -1 })

    return NextResponse.json({ quizzes }, { status: 200 })
  } catch (error) {
    console.error("Quizzes fetch error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const quizData = await request.json()

    const quiz = await Quiz.create({
      ...quizData,
      createdBy: decoded.userId,
    })

    return NextResponse.json({ quiz }, { status: 201 })
  } catch (error) {
    console.error("Quiz creation error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}
