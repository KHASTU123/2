import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Score from "@/lib/models/Score"
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

    const scores = await Score.find({ userId: decoded.userId })

    if (scores.length === 0) {
      return NextResponse.json({
        analytics: {
          totalScores: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          subjectStats: [],
          recentTrend: [],
          typeStats: [],
        },
      })
    }

    // Calculate analytics
    const totalScores = scores.length
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score.percentage, 0) / totalScores)
    const highestScore = Math.max(...scores.map((s) => s.percentage))
    const lowestScore = Math.min(...scores.map((s) => s.percentage))

    // Subject statistics
    const subjectGroups = scores.reduce(
      (acc, score) => {
        if (!acc[score.subject]) {
          acc[score.subject] = []
        }
        acc[score.subject].push(score.percentage)
        return acc
      },
      {} as Record<string, number[]>,
    )

    const subjectStats = Object.entries(subjectGroups).map(([subject, percentages]) => ({
      subject,
      average: Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length),
      count: percentages.length,
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages),
    }))

    // Recent trend (last 10 scores)
    const recentScores = scores.slice(-10).reverse()
    const recentTrend = recentScores.map((score, index) => ({
      index: index + 1,
      percentage: score.percentage,
      subject: score.subject,
      date: score.date,
    }))

    // Type statistics
    const typeGroups = scores.reduce(
      (acc, score) => {
        if (!acc[score.type]) {
          acc[score.type] = []
        }
        acc[score.type].push(score.percentage)
        return acc
      },
      {} as Record<string, number[]>,
    )

    const typeStats = Object.entries(typeGroups).map(([type, percentages]) => ({
      type,
      average: Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length),
      count: percentages.length,
    }))

    return NextResponse.json({
      analytics: {
        totalScores,
        averageScore,
        highestScore,
        lowestScore,
        subjectStats,
        recentTrend,
        typeStats,
      },
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 })
  }
}
