import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import Score from "@/lib/models/Score"
import SurveyResponse from "@/lib/models/SurveyResponse"
import QuizAttempt from "@/lib/models/QuizAttempt"
import DataAnalytics from "@/lib/models/DataAnalytics"
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

    // Collect all user data
    const user = await User.findById(decoded.userId).select("-password")
    const scores = await Score.find({ userId: decoded.userId }).sort({ createdAt: -1 })
    const surveyResponses = await SurveyResponse.find({ userId: decoded.userId }).populate("surveyId", "title type")
    const quizAttempts = await QuizAttempt.find({ userId: decoded.userId }).populate("quizId", "title subject")

    // Calculate comprehensive metrics
    const analytics = await calculateComprehensiveAnalytics(user, scores, surveyResponses, quizAttempts)

    // Generate AI deep analysis
    const aiAnalysis = await generateDeepAIAnalysis(user, scores, surveyResponses, quizAttempts, analytics)

    // Save analytics to database
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const dataAnalytics = await DataAnalytics.findOneAndUpdate(
      {
        userId: decoded.userId,
        period: "monthly",
        periodStart,
      },
      {
        periodEnd,
        rawMetrics: analytics.rawMetrics,
        performance: analytics.performance,
        patterns: analytics.patterns,
        aiAnalysis,
        comparative: analytics.comparative,
      },
      { upsert: true, new: true },
    )

    return NextResponse.json({ analytics: dataAnalytics }, { status: 200 })
  } catch (error) {
    console.error("Comprehensive analytics error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}

async function calculateComprehensiveAnalytics(user: any, scores: any[], surveyResponses: any[], quizAttempts: any[]) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Filter data for current month
  const monthlyScores = scores.filter((s) => s.createdAt >= monthStart)
  const monthlySurveys = surveyResponses.filter((s) => s.createdAt >= monthStart)
  const monthlyQuizzes = quizAttempts.filter((q) => q.createdAt >= monthStart)

  // Raw metrics
  const rawMetrics = {
    totalScores: monthlyScores.length,
    totalSurveys: monthlySurveys.length,
    totalQuizzes: monthlyQuizzes.length,
    totalStudyTime: calculateStudyTime(monthlyScores, monthlySurveys, monthlyQuizzes),
    activeDays: calculateActiveDays(monthlyScores, monthlySurveys, monthlyQuizzes),
  }

  // Performance analytics
  const performance = {
    averageScore:
      monthlyScores.length > 0 ? monthlyScores.reduce((sum, s) => sum + s.percentage, 0) / monthlyScores.length : 0,
    scoreImprovement: calculateScoreImprovement(scores),
    consistencyScore: calculateConsistencyScore(monthlyScores),
    learningVelocity: rawMetrics.totalScores / 4, // per week
    engagementLevel: calculateEngagementLevel(rawMetrics),
  }

  // Learning patterns
  const patterns = {
    preferredStudyTime: analyzeStudyTime(scores),
    optimalSessionLength: calculateOptimalSession(scores),
    difficultyPreference: analyzeDifficultyPreference(scores, quizAttempts),
    subjectStrengths: getSubjectStrengths(scores),
    subjectWeaknesses: getSubjectWeaknesses(scores),
    learningStyle: getLearningStyle(surveyResponses),
  }

  // Comparative analytics (mock data for demo)
  const comparative = {
    peerRanking: Math.floor(Math.random() * 100),
    gradeAverage: 75 + Math.random() * 20,
    nationalAverage: 70 + Math.random() * 15,
    improvementRate: performance.scoreImprovement,
  }

  return { rawMetrics, performance, patterns, comparative }
}

async function generateDeepAIAnalysis(
  user: any,
  scores: any[],
  surveyResponses: any[],
  quizAttempts: any[],
  analytics: any,
) {
  try {
    const systemPrompt = `
    Bạn là chuyên gia phân tích giáo dục với 20 năm kinh nghiệm. Hãy phân tích toàn diện dữ liệu học tập:
    
    Thông tin học sinh:
    - Tên: ${user.name}
    - Lớp: ${user.grade || "Chưa xác định"}
    - Điểm trung bình: ${analytics.performance.averageScore.toFixed(1)}%
    - Tính nhất quán: ${analytics.performance.consistencyScore}%
    - Mức độ tham gia: ${analytics.performance.engagementLevel}%
    
    Dữ liệu tháng này:
    - Số bài kiểm tra: ${analytics.rawMetrics.totalScores}
    - Số khảo sát: ${analytics.rawMetrics.totalSurveys}
    - Số quiz: ${analytics.rawMetrics.totalQuizzes}
    - Ngày học tích cực: ${analytics.rawMetrics.activeDays}
    
    Phong cách học tập:
    - Thời gian ưa thích: ${analytics.patterns.preferredStudyTime}
    - Độ khó ưa thích: ${analytics.patterns.difficultyPreference}
    - Môn mạnh: ${analytics.patterns.subjectStrengths.join(", ")}
    - Môn yếu: ${analytics.patterns.subjectWeaknesses.join(", ")}
    
    Trả về JSON với format:
    {
      "deepInsights": "Phân tích sâu 400-500 từ về xu hướng học tập, điểm mạnh/yếu, cơ hội cải thiện",
      "personalizedRecommendations": ["Gợi ý cụ thể 1", "Gợi ý cụ thể 2", "Gợi ý cụ thể 3", "Gợi ý cụ thể 4", "Gợi ý cụ thể 5"],
      "actionPlan": {
        "shortTerm": ["Hành động 1-2 tuần", "Hành động 1-2 tuần"],
        "mediumTerm": ["Hành động 1-3 tháng", "Hành động 1-3 tháng"],
        "longTerm": ["Hành động 3+ tháng", "Hành động 3+ tháng"]
      },
      "riskFactors": ["Yếu tố rủi ro 1", "Yếu tố rủi ro 2"],
      "successPredictions": {
        "nextExamScore": 85,
        "semesterGoalAchievement": 0.8,
        "universityReadiness": 75
      },
      "confidenceScore": 0.9
    }
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Phân tích toàn diện dữ liệu học tập của ${user.name}`,
    })

    try {
      return JSON.parse(text)
    } catch {
      return {
        deepInsights: text.substring(0, 800),
        personalizedRecommendations: [
          "Tăng cường luyện tập môn yếu",
          "Duy trì thói quen học tập đều đặn",
          "Tham gia thêm hoạt động nhóm",
        ],
        actionPlan: {
          shortTerm: ["Ôn tập 30 phút mỗi ngày", "Làm bài tập về nhà đầy đủ"],
          mediumTerm: ["Tham gia khóa học bổ trợ", "Cải thiện kỹ năng quản lý thời gian"],
          longTerm: ["Chuẩn bị kỳ thi quan trọng", "Phát triển kỹ năng tự học"],
        },
        riskFactors: ["Thiếu tính nhất quán", "Cần cải thiện môn yếu"],
        successPredictions: {
          nextExamScore: 80,
          semesterGoalAchievement: 0.75,
          universityReadiness: 70,
        },
        confidenceScore: 0.8,
      }
    }
  } catch (error) {
    console.error("Deep AI analysis error:", error)
    return {
      deepInsights: "Không thể tạo phân tích AI chi tiết lúc này",
      personalizedRecommendations: [],
      actionPlan: { shortTerm: [], mediumTerm: [], longTerm: [] },
      riskFactors: [],
      successPredictions: {
        nextExamScore: 0,
        semesterGoalAchievement: 0,
        universityReadiness: 0,
      },
      confidenceScore: 0.5,
    }
  }
}

// Helper functions
function calculateStudyTime(scores: any[], surveys: any[], quizzes: any[]): number {
  const scoreTime = scores.length * 15 // 15 minutes per score entry
  const surveyTime = surveys.reduce((sum, s) => sum + s.completionTime / 60, 0)
  const quizTime = quizzes.reduce((sum, q) => sum + q.totalTime / 60, 0)
  return Math.round(scoreTime + surveyTime + quizTime)
}

function calculateActiveDays(scores: any[], surveys: any[], quizzes: any[]): number {
  const dates = new Set()
  scores.forEach((s) => dates.add(s.createdAt.toDateString()))
  surveys.forEach((s) => dates.add(s.createdAt.toDateString()))
  quizzes.forEach((q) => dates.add(q.createdAt.toDateString()))
  return dates.size
}

function calculateScoreImprovement(scores: any[]): number {
  if (scores.length < 2) return 0
  const recent = scores.slice(0, 5)
  const older = scores.slice(5, 10)
  if (older.length === 0) return 0

  const recentAvg = recent.reduce((sum, s) => sum + s.percentage, 0) / recent.length
  const olderAvg = older.reduce((sum, s) => sum + s.percentage, 0) / older.length
  return recentAvg - olderAvg
}

function calculateConsistencyScore(scores: any[]): number {
  if (scores.length < 3) return 50
  const percentages = scores.map((s) => s.percentage)
  const mean = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
  const variance = percentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / percentages.length
  const stdDev = Math.sqrt(variance)
  return Math.max(0, Math.min(100, 100 - stdDev))
}

function calculateEngagementLevel(rawMetrics: any): number {
  const totalActivities = rawMetrics.totalScores + rawMetrics.totalSurveys + rawMetrics.totalQuizzes
  const engagementScore = Math.min(100, totalActivities * 10 + rawMetrics.activeDays * 5)
  return Math.round(engagementScore)
}

function analyzeStudyTime(scores: any[]): string {
  const hourCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 }
  scores.forEach((score) => {
    const hour = score.createdAt.getHours()
    if (hour >= 6 && hour < 12) hourCounts.morning++
    else if (hour >= 12 && hour < 18) hourCounts.afternoon++
    else if (hour >= 18 && hour < 22) hourCounts.evening++
    else hourCounts.night++
  })

  return Object.entries(hourCounts).reduce((a, b) => (hourCounts[a[0]] > hourCounts[b[0]] ? a : b))[0]
}

function calculateOptimalSession(scores: any[]): number {
  // Mock calculation - in real app, track actual session times
  return 45 + Math.floor(Math.random() * 30) // 45-75 minutes
}

function analyzeDifficultyPreference(scores: any[], quizzes: any[]): string {
  const difficulties = { easy: 0, medium: 0, hard: 0 }
  scores.forEach((score) => {
    if (score.difficulty) difficulties[score.difficulty]++
  })
  quizzes.forEach((quiz) => {
    if (quiz.difficulty) difficulties[quiz.difficulty]++
  })

  return Object.entries(difficulties).reduce((a, b) => (difficulties[a[0]] > difficulties[b[0]] ? a : b))[0] || "medium"
}

function getSubjectStrengths(scores: any[]): string[] {
  const subjectAvgs = calculateSubjectAverages(scores)
  return Object.entries(subjectAvgs)
    .filter(([_, avg]) => avg >= 85)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([subject, _]) => subject)
}

function getSubjectWeaknesses(scores: any[]): string[] {
  const subjectAvgs = calculateSubjectAverages(scores)
  return Object.entries(subjectAvgs)
    .filter(([_, avg]) => avg < 70)
    .sort(([_, a], [__, b]) => a - b)
    .slice(0, 3)
    .map(([subject, _]) => subject)
}

function calculateSubjectAverages(scores: any[]): Record<string, number> {
  const subjectData: Record<string, { total: number; count: number }> = {}

  scores.forEach((score) => {
    if (!subjectData[score.subject]) {
      subjectData[score.subject] = { total: 0, count: 0 }
    }
    subjectData[score.subject].total += score.percentage
    subjectData[score.subject].count += 1
  })

  const averages: Record<string, number> = {}
  Object.entries(subjectData).forEach(([subject, data]) => {
    averages[subject] = data.total / data.count
  })

  return averages
}

function getLearningStyle(surveyResponses: any[]): string {
  // Extract learning style from survey responses
  const styles = surveyResponses
    .filter((response) => response.aiAnalysis?.learningStyle)
    .map((response) => response.aiAnalysis.learningStyle)

  if (styles.length === 0) return "visual"

  // Return most common style
  const styleCounts = styles.reduce(
    (acc, style) => {
      acc[style] = (acc[style] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(styleCounts).reduce((a, b) => (styleCounts[a[0]] > styleCounts[b[0]] ? a : b))[0]
}
