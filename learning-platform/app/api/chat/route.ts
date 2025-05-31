import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import Score from "@/lib/models/Score"
import ChatMessage from "@/lib/models/ChatMessage"
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

    const { message } = await request.json()

    // Lấy thông tin user và điểm số
    const user = await User.findById(decoded.userId).select("-password")
    const scores = await Score.find({ userId: decoded.userId }).sort({ createdAt: -1 }).limit(20)

    // Tạo context cho AI
    const userContext = {
      name: user.name,
      scores: scores.map((s) => ({
        subject: s.subject,
        score: s.score,
        maxScore: s.maxScore,
        percentage: s.percentage,
        type: s.type,
        date: s.date,
      })),
      universityAspirations: user.universityAspirations || [],
      standardizedTests: user.standardizedTests || {},
      learningPreferences: user.learningPreferences || {},
      grade: user.grade || "Chưa cập nhật",
    }

    // Tạo system prompt
    const systemPrompt = `
    Bạn là AI Assistant chuyên về giáo dục và tư vấn học tập tại Việt Nam. 
    
    Thông tin học sinh:
    - Tên: ${userContext.name}
    - Lớp: ${userContext.grade}
    - Điểm số gần đây: ${JSON.stringify(userContext.scores.slice(0, 5))}
    - Nguyện vọng đại học: ${JSON.stringify(userContext.universityAspirations)}
    - Điểm thi chuẩn hóa: ${JSON.stringify(userContext.standardizedTests)}
    
    Nhiệm vụ của bạn:
    1. Phân tích điểm số và đưa ra lời khuyên cụ thể
    2. Tư vấn về điểm chuẩn đại học, phương pháp học tập
    3. Đề xuất chiến lược học tập phù hợp với từng môn
    4. Hỗ trợ thông tin về IELTS, V-SAT, xét tuyển đại học
    5. Trả lời bằng tiếng Việt, thân thiện và chi tiết
    
    Luôn dựa vào dữ liệu thực tế của học sinh để đưa ra lời khuyên cá nhân hóa.
    `

    // Gọi OpenAI API
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: message,
    })

    // Lưu cuộc trò chuyện
    await ChatMessage.create({
      userId: decoded.userId,
      message,
      response: text,
      context: userContext,
      type: detectMessageType(message),
    })

    return NextResponse.json({ response: text }, { status: 200 })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}

function detectMessageType(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("điểm") || lowerMessage.includes("kết quả")) {
    return "score_analysis"
  }
  if (lowerMessage.includes("đại học") || lowerMessage.includes("xét tuyển")) {
    return "university_advice"
  }
  if (lowerMessage.includes("phương pháp") || lowerMessage.includes("học tập")) {
    return "study_method"
  }

  return "general"
}
