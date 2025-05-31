import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Score from "@/lib/models/Score"
import { verifyToken } from "@/lib/auth"

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

    const { subject, score, maxScore, type, difficulty, description } = await request.json()

    // Validation
    if (!subject || score === undefined || !maxScore) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 })
    }

    if (score < 0 || score > maxScore) {
      return NextResponse.json({ message: "Điểm số không hợp lệ" }, { status: 400 })
    }

    const newScore = await Score.create({
      userId: decoded.userId,
      subject,
      score: Number(score),
      maxScore: Number(maxScore),
      type: type || "quiz",
      difficulty: difficulty || "medium",
      description: description || "",
    })

    return NextResponse.json({ message: "Thêm điểm thành công", score: newScore }, { status: 201 })
  } catch (error) {
    console.error("Score creation error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}

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

    const scores = await Score.find({ userId: decoded.userId }).sort({ createdAt: -1 })

    return NextResponse.json({ scores }, { status: 200 })
  } catch (error) {
    console.error("Scores fetch error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}
