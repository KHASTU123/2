"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Lightbulb, Target, BookOpen, TrendingUp, Zap, Star, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Recommendation {
  _id: string
  type: "study_method" | "university_advice" | "score_improvement" | "career_guidance"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  tags: string[]
  actionItems: string[]
  estimatedTime: string
  difficulty: "beginner" | "intermediate" | "advanced"
  createdAt: string
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/recommendations")
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecommendations = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/recommendations/generate", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setRecommendations([...data.recommendations, ...recommendations])
        toast({
          title: "Thành công!",
          description: "AI đã tạo ra các đề xuất mới cho bạn",
        })
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Có lỗi xảy ra khi tạo đề xuất",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Ưu tiên cao"
      case "medium":
        return "Ưu tiên trung bình"
      case "low":
        return "Ưu tiên thấp"
      default:
        return priority
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "study_method":
        return <BookOpen className="h-5 w-5 text-blue-600" />
      case "university_advice":
        return <Target className="h-5 w-5 text-green-600" />
      case "score_improvement":
        return <TrendingUp className="h-5 w-5 text-purple-600" />
      case "career_guidance":
        return <Star className="h-5 w-5 text-orange-600" />
      default:
        return <Lightbulb className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "study_method":
        return "Phương pháp học tập"
      case "university_advice":
        return "Tư vấn đại học"
      case "score_improvement":
        return "Cải thiện điểm số"
      case "career_guidance":
        return "Hướng nghiệp"
      default:
        return type
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700"
      case "intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "advanced":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Cơ bản"
      case "intermediate":
        return "Trung bình"
      case "advanced":
        return "Nâng cao"
      default:
        return difficulty
    }
  }

  const filteredRecommendations = recommendations.filter((rec) => {
    if (activeTab === "all") return true
    return rec.type === activeTab
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đề xuất từ AI</h1>
          <p className="text-gray-600">Nhận gợi ý cá nhân hóa để cải thiện học tập</p>
        </div>
        <Button onClick={generateRecommendations} disabled={isGenerating} className="flex items-center space-x-2">
          {isGenerating ? (
            <>
              <Brain className="h-4 w-4 animate-pulse" />
              <span>AI đang phân tích...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>Tạo đề xuất mới</span>
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="study_method">Phương pháp học</TabsTrigger>
          <TabsTrigger value="university_advice">Tư vấn ĐH</TabsTrigger>
          <TabsTrigger value="score_improvement">Cải thiện điểm</TabsTrigger>
          <TabsTrigger value="career_guidance">Hướng nghiệp</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredRecommendations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đề xuất nào</h3>
                <p className="text-gray-500 text-center mb-4">
                  Hãy tạo đề xuất đầu tiên để nhận gợi ý cá nhân hóa từ AI
                </p>
                <Button onClick={generateRecommendations} disabled={isGenerating}>
                  <Zap className="h-4 w-4 mr-2" />
                  Tạo đề xuất ngay
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation) => (
                <Card
                  key={recommendation._id}
                  className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(recommendation.type)}
                        <div>
                          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                          <CardDescription className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{getTypeLabel(recommendation.type)}</Badge>
                            <Badge className={getPriorityColor(recommendation.priority)}>
                              {getPriorityLabel(recommendation.priority)}
                            </Badge>
                            <Badge className={getDifficultyColor(recommendation.difficulty)}>
                              {getDifficultyLabel(recommendation.difficulty)}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{recommendation.estimatedTime}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{recommendation.description}</p>

                    {recommendation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recommendation.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {recommendation.actionItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span>Hành động cụ thể:</span>
                        </h4>
                        <ul className="space-y-1">
                          {recommendation.actionItems.map((item, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-gray-500">
                        Tạo ngày {new Date(recommendation.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <Button size="sm" variant="outline">
                        Áp dụng ngay
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
