import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import StudyMethod from "@/lib/models/StudyMethod"
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

    const { subject, targetAudience, learningStyle } = await request.json()
    const user = await User.findById(decoded.userId)

    const systemPrompt = `
    Bạn là chuyên gia giáo dục, hãy tạo ra các phương pháp học tập chi tiết cho:
    - Môn học: ${subject}
    - Đối tượng: ${targetAudience}
    - Phong cách học: ${learningStyle}
    - Học sinh: ${user.name} (${user.grade || "Chưa xác định"})
    
    Trả về JSON với format:
    {
      "methods": [
        {
          "name": "Tên phương pháp",
          "description": "Mô tả chi tiết",
          "difficulty": "beginner|intermediate|advanced",
          "timeRequired": "Thời gian cần thiết",
          "effectiveness": 85,
          "personalizedTips": ["Tip 1", "Tip 2"],
          "resources": ["Tài liệu 1", "Tài liệu 2"]
        }
      ]
    }
    
    Tạo ít nhất 3-5 phương pháp khác nhau, từ cơ bản đến nâng cao.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Tạo phương pháp học tập cho môn ${subject}`,
    })

    let methods
    try {
      methods = JSON.parse(text)
    } catch {
      // Fallback nếu AI không trả về JSON hợp lệ
      methods = {
        methods: [
          {
            name: "Phương pháp tổng hợp",
            description: text,
            difficulty: "intermediate",
            timeRequired: "2-3 giờ/ngày",
            effectiveness: 80,
            personalizedTips: ["Luyện tập đều đặn", "Ghi chú chi tiết"],
            resources: ["Sách giáo khoa", "Bài tập trực tuyến"],
          },
        ],
      }
    }

    // Lưu vào database
    const studyMethod = await StudyMethod.create({
      userId: decoded.userId,
      subject,
      methods: methods.methods,
      targetAudience,
      learningStyle,
    })

    return NextResponse.json({ studyMethod }, { status: 201 })
  } catch (error) {
    console.error("Study methods error:", error)
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

    const studyMethods = await StudyMethod.find({ userId: decoded.userId }).sort({ createdAt: -1 })

    return NextResponse.json({ studyMethods }, { status: 200 })
  } catch (error) {
    console.error("Study methods fetch error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}
