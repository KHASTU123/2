import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import Score from "@/lib/models/Score"
import Recommendation from "@/lib/models/Recommendation"
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

    // Lấy thông tin user và điểm số
    const user = await User.findById(decoded.userId).select("-password")
    const scores = await Score.find({ userId: decoded.userId }).sort({ createdAt: -1 }).limit(20)

    // Tạo context cho AI
    const userContext = {
      name: user.name,
      grade: user.grade || "Chưa xác định",
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
    }

    // Tính toán thống kê
    const avgScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length : 0
    const weakSubjects = getWeakSubjects(scores)
    const strongSubjects = getStrongSubjects(scores)

    const systemPrompt = `
    Bạn là AI Advisor chuyên về giáo dục tại Việt Nam. Hãy phân tích dữ liệu học sinh và tạo ra các đề xuất cá nhân hóa.
    
    Thông tin học sinh:
    - Tên: ${userContext.name}
    - Lớp: ${userContext.grade}
    - Điểm trung bình: ${avgScore.toFixed(1)}%
    - Môn yếu: ${weakSubjects.join(", ") || "Không có"}
    - Môn mạnh: ${strongSubjects.join(", ") || "Không có"}
    - Nguyện vọng: ${JSON.stringify(userContext.universityAspirations)}
    - Điểm thi chuẩn: ${JSON.stringify(userContext.standardizedTests)}
    
    Hãy tạo 3-5 đề xuất cụ thể với format JSON:
    {
      "recommendations": [
        {
          "type": "study_method|university_advice|score_improvement|career_guidance",
          "title": "Tiêu đề ngắn gọn",
          "description": "Mô tả chi tiết 2-3 câu",
          "priority": "high|medium|low",
          "tags": ["tag1", "tag2"],
          "actionItems": ["Hành động 1", "Hành động 2"],
          "estimatedTime": "1-2 tuần",
          "difficulty": "beginner|intermediate|advanced"
        }
      ]
    }
    
    Tập trung vào:
    1. Cải thiện môn yếu
    2. Tư vấn nguyện vọng đại học
    3. Phương pháp học tập hiệu quả
    4. Chuẩn bị thi chuẩn hóa
    5. Hướng nghiệp phù hợp
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Tạo đề xuất cá nhân hóa cho học sinh ${userContext.name}`,
    })

    let recommendationsData
    try {
      recommendationsData = JSON.parse(text)
    } catch {
      // Fallback nếu AI không trả về JSON hợp lệ
      recommendationsData = {
        recommendations: [
          {
            type: "study_method",
            title: "Cải thiện phương pháp học tập",
            description: text.substring(0, 200) + "...",
            priority: "medium",
            tags: ["học tập", "cải thiện"],
            actionItems: ["Lập kế hoạch học tập", "Thực hành đều đặn"],
            estimatedTime: "2-3 tuần",
            difficulty: "intermediate",
          },
        ],
      }
    }

    // Lưu vào database
    const savedRecommendations = []
    for (const rec of recommendationsData.recommendations) {
      const recommendation = await Recommendation.create({
        userId: decoded.userId,
        ...rec,
      })
      savedRecommendations.push(recommendation)
    }

    return NextResponse.json({ recommendations: savedRecommendations }, { status: 201 })
  } catch (error) {
    console.error("Generate recommendations error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}

function getWeakSubjects(scores: any[]): string[] {
  const subjectAvgs = scores.reduce(
    (acc, score) => {
      if (!acc[score.subject]) {
        acc[score.subject] = { total: 0, count: 0 }
      }
      acc[score.subject].total += score.percentage
      acc[score.subject].count += 1
      return acc
    },
    {} as Record<string, { total: number; count: number }>,
  )

  return Object.entries(subjectAvgs)
    .map(([subject, data]) => ({
      subject,
      avg: data.total / data.count,
    }))
    .filter((item) => item.avg < 70)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3)
    .map((item) => item.subject)
}

function getStrongSubjects(scores: any[]): string[] {
  const subjectAvgs = scores.reduce(
    (acc, score) => {
      if (!acc[score.subject]) {
        acc[score.subject] = { total: 0, count: 0 }
      }
      acc[score.subject].total += score.percentage
      acc[score.subject].count += 1
      return acc
    },
    {} as Record<string, { total: number; count: number }>,
  )

  return Object.entries(subjectAvgs)
    .map(([subject, data]) => ({
      subject,
      avg: data.total / data.count,
    }))
    .filter((item) => item.avg >= 85)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3)
    .map((item) => item.subject)
}
