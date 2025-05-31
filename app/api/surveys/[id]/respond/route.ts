import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import dbConnect from "@/lib/mongodb"
import Survey from "@/lib/models/Survey"
import SurveyResponse from "@/lib/models/SurveyResponse"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { responses, completionTime } = await request.json()

    // Get survey details
    const survey = await Survey.findById(params.id)
    if (!survey) {
      return NextResponse.json({ message: "Survey not found" }, { status: 404 })
    }

    // Calculate score for quiz-type surveys
    let score = 0
    if (survey.type === "quiz") {
      responses.forEach((response: any) => {
        const question = survey.questions.find((q: any) => q.id === response.questionId)
        if (question && question.correctAnswer === response.answer) {
          score += question.weight || 1
        }
      })
    }

    // Generate AI analysis
    const aiAnalysis = await generateAIAnalysis(survey, responses, decoded.userId)

    // Save response
    const surveyResponse = await SurveyResponse.create({
      surveyId: params.id,
      userId: decoded.userId,
      responses,
      completionTime,
      isCompleted: true,
      score,
      aiAnalysis,
    })

    // Update survey analytics
    await Survey.findByIdAndUpdate(params.id, {
      $inc: { totalResponses: 1 },
    })

    return NextResponse.json(
      {
        response: surveyResponse,
        aiAnalysis,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Survey response error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}

async function generateAIAnalysis(survey: any, responses: any[], userId: string) {
  try {
    const systemPrompt = `
    Bạn là chuyên gia phân tích tâm lý học và giáo dục. Hãy phân tích phản hồi khảo sát sau:
    
    Loại khảo sát: ${survey.type}
    Tiêu đề: ${survey.title}
    Mô tả: ${survey.description}
    
    Phản hồi của học sinh:
    ${JSON.stringify(responses, null, 2)}
    
    Hãy trả về JSON với format:
    {
      "insights": "Phân tích sâu 200-300 từ về tính cách, sở thích, điểm mạnh/yếu",
      "recommendations": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"],
      "personalityTraits": ["Trait 1", "Trait 2", "Trait 3"],
      "learningStyle": "visual|auditory|kinesthetic|reading",
      "confidenceScore": 0.85
    }
    
    Phân tích phải cụ thể, cá nhân hóa và có thể hành động được.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Phân tích khảo sát ${survey.type} với ${responses.length} câu trả lời`,
    })

    try {
      return JSON.parse(text)
    } catch {
      return {
        insights: text.substring(0, 500),
        recommendations: ["Tiếp tục học tập đều đặn", "Tham gia thêm hoạt động"],
        personalityTraits: ["Chăm chỉ", "Tích cực"],
        learningStyle: "visual",
        confidenceScore: 0.7,
      }
    }
  } catch (error) {
    console.error("AI analysis error:", error)
    return {
      insights: "Không thể tạo phân tích AI lúc này",
      recommendations: [],
      personalityTraits: [],
      learningStyle: "visual",
      confidenceScore: 0.5,
    }
  }
}
