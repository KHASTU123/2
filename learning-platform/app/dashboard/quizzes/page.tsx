"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, Trophy, Play, CheckCircle, Users, Target } from "lucide-react"

interface Quiz {
  _id: string
  title: string
  description: string
  subject: string
  category: string
  difficulty: string
  questions: any[]
  timeLimit: number
  passingScore: number
  maxAttempts: number
  analytics: {
    totalAttempts: number
    averageScore: number
    passRate: number
  }
  createdBy: {
    name: string
  }
  createdAt: string
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes")
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes)
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      hard: "bg-red-100 text-red-700",
    }
    return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: "Dễ",
      medium: "Trung bình",
      hard: "Khó",
    }
    return labels[difficulty as keyof typeof labels] || difficulty
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz & Kiểm tra</h1>
          <p className="text-gray-600">Thử thách bản thân với các bài quiz thú vị</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Brain className="h-4 w-4" />
            <span>{quizzes.length} quiz</span>
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng quiz</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">
                  {quizzes.filter((q) => q.analytics.totalAttempts > 0).length}
                </p>
              </div>
              <div className="rounded-full bg-green-50 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng lượt thi</p>
                <p className="text-2xl font-bold text-purple-600">
                  {quizzes.reduce((sum, q) => sum + q.analytics.totalAttempts, 0)}
                </p>
              </div>
              <div className="rounded-full bg-purple-50 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ đậu TB</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(quizzes.reduce((sum, q) => sum + (q.analytics.passRate || 0), 0) / quizzes.length || 0)}%
                </p>
              </div>
              <div className="rounded-full bg-orange-50 p-3">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz._id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                  <CardDescription className="mt-2 line-clamp-3">{quiz.description}</CardDescription>
                </div>
                <Badge className={getDifficultyColor(quiz.difficulty)}>{getDifficultyLabel(quiz.difficulty)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span>{quiz.subject}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{quiz.timeLimit} phút</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-gray-500" />
                  <span>{quiz.questions.length} câu hỏi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <span>Đậu: {quiz.passingScore}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tỷ lệ đậu</span>
                  <span>{quiz.analytics.passRate || 0}%</span>
                </div>
                <Progress value={quiz.analytics.passRate || 0} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Điểm TB</span>
                  <span>{quiz.analytics.averageScore || 0}%</span>
                </div>
                <Progress value={quiz.analytics.averageScore || 0} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  <p>Bởi {quiz.createdBy.name}</p>
                  <p>{quiz.analytics.totalAttempts} lượt thi</p>
                </div>
                <Button asChild size="sm">
                  <Link href={`/dashboard/quizzes/${quiz._id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Bắt đầu
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có quiz nào</h3>
            <p className="text-gray-500 text-center">Các quiz sẽ xuất hiện ở đây khi có sẵn</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
