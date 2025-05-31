import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import dbConnect from "@/lib/mongodb"
import Quiz from "@/lib/models/Quiz"
import QuizAttempt from "@/lib/models/QuizAttempt"
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

    const { answers, totalTime } = await request.json()

    // Get quiz details
    const quiz = await Quiz.findById(params.id)
    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 })
    }

    // Check attempt limit
    const existingAttempts = await QuizAttempt.countDocuments({
      quizId: params.id,
      userId: decoded.userId,
    })

    if (existingAttempts >= quiz.maxAttempts) {
      return NextResponse.json({ message: "Đã hết lượt làm bài" }, { status: 400 })
    }

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0
    const processedAnswers = []

    for (const answer of answers) {
      const question = quiz.questions.find((q: any) => q.id === answer.questionId)
      if (!question) continue

      const isCorrect = checkAnswer(question, answer.userAnswer)
      const points = isCorrect ? question.points || 1 : 0

      totalPoints += question.points || 1
      earnedPoints += points

      processedAnswers.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points,
        timeSpent: answer.timeSpent || 0,
      })
    }

    const score = earnedPoints
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const isPassed = percentage >= quiz.passingScore

    // Generate AI analysis
    const aiAnalysis = await generateQuizAIAnalysis(quiz, processedAnswers, percentage)

    // Save attempt
    const attempt = await QuizAttempt.create({
      quizId: params.id,
      userId: decoded.userId,
      answers: processedAnswers,
      score,
      percentage,
      totalTime,
      isPassed,
      attemptNumber: existingAttempts + 1,
      aiAnalysis,
    })

    // Update quiz analytics
    await Quiz.findByIdAndUpdate(params.id, {
      $inc: { "analytics.totalAttempts": 1 },
    })

    return NextResponse.json(
      {
        attempt,
        aiAnalysis,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Quiz attempt error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}

function checkAnswer(question: any, userAnswer: any): boolean {
  switch (question.type) {
    case "multiple_choice":
    case "true_false":
      return userAnswer === question.correctAnswer
    case "fill_blank":
      return userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()
    case "matching":
      return JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)
    default:
      return false
  }
}

async function generateQuizAIAnalysis(quiz: any, answers: any[], percentage: number) {
  try {
    const correctAnswers = answers.filter((a) => a.isCorrect).length
    const totalAnswers = answers.length

    const systemPrompt = `
    Bạn là chuyên gia phân tích giáo dục. Hãy phân tích kết quả quiz sau:
    
    Quiz: ${quiz.title}
    Môn học: ${quiz.subject}
    Độ khó: ${quiz.difficulty}
    Điểm số: ${percentage}% (${correctAnswers}/${totalAnswers} câu đúng)
    
    Câu trả lời chi tiết:
    ${JSON.stringify(answers, null, 2)}
    
    Hãy trả về JSON với format:
    {
      "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
      "weaknesses": ["Điểm yếu 1", "Điểm yếu 2"],
      "recommendations": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"],
      "nextSteps": ["Bước tiếp theo 1", "Bước tiếp theo 2"],
      "confidenceScore": 0.85
    }
    
    Phân tích phải cụ thể và có thể hành động được.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Phân tích kết quả quiz ${quiz.title} với điểm ${percentage}%`,
    })

    try {
      return JSON.parse(text)
    } catch {
      return {
        strengths: percentage >= 80 ? ["Hiểu bài tốt", "Làm bài cẩn thận"] : ["Cố gắng hoàn thành bài"],
        weaknesses: percentage < 70 ? ["Cần ôn tập thêm", "Chưa nắm vững kiến thức"] : [],
        recommendations: ["Tiếp tục luyện tập", "Ôn tập kiến thức cơ bản"],
        nextSteps: ["Làm thêm bài tập", "Tham khảo tài liệu"],
        confidenceScore: 0.7,
      }
    }
  } catch (error) {
    console.error("Quiz AI analysis error:", error)
    return {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      nextSteps: [],
      confidenceScore: 0.5,
    }
  }
}
