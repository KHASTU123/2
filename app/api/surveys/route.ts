import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Survey from "@/lib/models/Survey"
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

    const surveys = await Survey.find({ isActive: true }).populate("createdBy", "name").sort({ createdAt: -1 })

    return NextResponse.json({ surveys }, { status: 200 })
  } catch (error) {
    console.error("Surveys fetch error:", error)
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

    const surveyData = await request.json()

    const survey = await Survey.create({
      ...surveyData,
      createdBy: decoded.userId,
    })

    return NextResponse.json({ survey }, { status: 201 })
  } catch (error) {
    console.error("Survey creation error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}
