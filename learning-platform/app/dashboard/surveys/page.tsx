"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ClipboardList, Users, Clock, TrendingUp, Play, CheckCircle, BarChart3 } from "lucide-react"

interface Survey {
  _id: string
  title: string
  description: string
  type: string
  targetAudience: string
  estimatedTime: number
  totalResponses: number
  questions: any[]
  createdBy: {
    name: string
  }
  createdAt: string
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      const response = await fetch("/api/surveys")
      if (response.ok) {
        const data = await response.json()
        setSurveys(data.surveys)
      }
    } catch (error) {
      console.error("Error fetching surveys:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const types = {
      preference: "Sở thích",
      skill_assessment: "Đánh giá kỹ năng",
      feedback: "Phản hồi",
      personality: "Tính cách",
      quiz: "Câu đố",
    }
    return types[type as keyof typeof types] || type
  }

  const getTypeColor = (type: string) => {
    const colors = {
      preference: "bg-blue-100 text-blue-700",
      skill_assessment: "bg-green-100 text-green-700",
      feedback: "bg-yellow-100 text-yellow-700",
      personality: "bg-purple-100 text-purple-700",
      quiz: "bg-red-100 text-red-700",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  const getAudienceLabel = (audience: string) => {
    const audiences = {
      elementary: "Tiểu học",
      middle_school: "THCS",
      high_school: "THPT",
      university: "Đại học",
      all: "Tất cả",
    }
    return audiences[audience as keyof typeof audiences] || audience
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải khảo sát...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khảo sát & Đánh giá</h1>
          <p className="text-gray-600">Tham gia khảo sát để nhận phân tích cá nhân hóa từ AI</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Xem phân tích
            </Link>
          </Button>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <ClipboardList className="h-4 w-4" />
            <span>{surveys.length} khảo sát</span>
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng khảo sát</p>
                <p className="text-2xl font-bold text-gray-900">{surveys.length}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <ClipboardList className="h-6 w-6 text-blue-600" />
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
                  {surveys.filter((s) => s.totalResponses > 0).length}
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
                <p className="text-sm font-medium text-gray-600">Tổng phản hồi</p>
                <p className="text-2xl font-bold text-purple-600">
                  {surveys.reduce((sum, s) => sum + s.totalResponses, 0)}
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
                <p className="text-sm font-medium text-gray-600">Thời gian TB</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(surveys.reduce((sum, s) => sum + s.estimatedTime, 0) / surveys.length || 0)} phút
                </p>
              </div>
              <div className="rounded-full bg-orange-50 p-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Surveys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <Card key={survey._id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{survey.title}</CardTitle>
                  <CardDescription className="mt-2 line-clamp-3">{survey.description}</CardDescription>
                </div>
                <Badge className={getTypeColor(survey.type)}>{getTypeLabel(survey.type)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{getAudienceLabel(survey.targetAudience)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{survey.estimatedTime} phút</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClipboardList className="h-4 w-4 text-gray-500" />
                  <span>{survey.questions.length} câu hỏi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span>{survey.totalResponses} phản hồi</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Độ phổ biến</span>
                  <span>{Math.min(100, survey.totalResponses * 10)}%</span>
                </div>
                <Progress value={Math.min(100, survey.totalResponses * 10)} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">Bởi {survey.createdBy.name}</div>
                <Button asChild size="sm">
                  <Link href={`/dashboard/surveys/${survey._id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Bắt đầu
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {surveys.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có khảo sát nào</h3>
            <p className="text-gray-500 text-center">Các khảo sát sẽ xuất hiện ở đây khi có sẵn</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
