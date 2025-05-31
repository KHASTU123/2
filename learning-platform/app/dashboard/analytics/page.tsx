"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  Calendar,
  BarChart3,
  Users,
  Star,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ComprehensiveAnalytics {
  _id: string
  rawMetrics: {
    totalScores: number
    totalSurveys: number
    totalQuizzes: number
    totalStudyTime: number
    activeDays: number
  }
  performance: {
    averageScore: number
    scoreImprovement: number
    consistencyScore: number
    learningVelocity: number
    engagementLevel: number
  }
  patterns: {
    preferredStudyTime: string
    optimalSessionLength: number
    difficultyPreference: string
    subjectStrengths: string[]
    subjectWeaknesses: string[]
    learningStyle: string
  }
  aiAnalysis: {
    deepInsights: string
    personalizedRecommendations: string[]
    actionPlan: {
      shortTerm: string[]
      mediumTerm: string[]
      longTerm: string[]
    }
    riskFactors: string[]
    successPredictions: {
      nextExamScore: number
      semesterGoalAchievement: number
      universityReadiness: number
    }
    confidenceScore: number
    generatedAt: string
  }
  comparative: {
    peerRanking: number
    gradeAverage: number
    nationalAverage: number
    improvementRate: number
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Auto-load if analytics exist
    generateAnalytics()
  }, [])

  const generateAnalytics = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/analytics/comprehensive", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setAnalytics(data.analytics)
        toast({
          title: "Phân tích hoàn thành!",
          description: "AI đã tạo ra báo cáo phân tích toàn diện cho bạn.",
        })
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Có lỗi xảy ra khi tạo phân tích",
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

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-50"
    if (score >= 70) return "text-blue-600 bg-blue-50"
    if (score >= 60) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getConfidenceIndicator = (confidence: number) => {
    if (confidence >= 0.8) return { color: "text-green-600", label: "Rất tin cậy" }
    if (confidence >= 0.6) return { color: "text-blue-600", label: "Tin cậy" }
    if (confidence >= 0.4) return { color: "text-yellow-600", label: "Trung bình" }
    return { color: "text-red-600", label: "Cần cải thiện" }
  }

  const getStudyTimeLabel = (time: string) => {
    const labels = {
      morning: "Buổi sáng",
      afternoon: "Buổi chiều",
      evening: "Buổi tối",
      night: "Buổi đêm",
    }
    return labels[time as keyof typeof labels] || time
  }

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: "Dễ",
      medium: "Trung bình",
      hard: "Khó",
    }
    return labels[difficulty as keyof typeof labels] || difficulty
  }

  const getLearningStyleLabel = (style: string) => {
    const labels = {
      visual: "Thị giác",
      auditory: "Thính giác",
      kinesthetic: "Vận động",
      reading: "Đọc viết",
    }
    return labels[style as keyof typeof labels] || style
  }

  if (!analytics && !isGenerating) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Phân tích học tập toàn diện</h1>
          <p className="text-gray-600 mb-6">Nhận phân tích sâu về quá trình học tập của bạn từ AI</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tạo phân tích AI toàn diện</h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              AI sẽ phân tích tất cả dữ liệu học tập của bạn và đưa ra những nhận xét sâu sắc, dự đoán hiệu suất và kế
              hoạch hành động cụ thể.
            </p>
            <Button onClick={generateAnalytics} size="lg" disabled={isGenerating}>
              <Zap className="h-5 w-5 mr-2" />
              Tạo phân tích ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI đang phân tích...</h3>
          <p className="text-gray-600">Đang xử lý dữ liệu và tạo ra những nhận xét sâu sắc cho bạn</p>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const confidence = getConfidenceIndicator(analytics.aiAnalysis.confidenceScore)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân tích học tập toàn diện</h1>
          <p className="text-gray-600">Báo cáo chi tiết được tạo bởi AI</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={confidence.color}>
            <Brain className="h-4 w-4 mr-1" />
            {confidence.label}
          </Badge>
          <Button onClick={generateAnalytics} disabled={isGenerating}>
            <Zap className="h-4 w-4 mr-2" />
            Tạo mới
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="insights">Nhận xét AI</TabsTrigger>
          <TabsTrigger value="recommendations">Gợi ý</TabsTrigger>
          <TabsTrigger value="predictions">Dự đoán</TabsTrigger>
          <TabsTrigger value="action-plan">Kế hoạch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.performance.averageScore.toFixed(1)}%</p>
                  </div>
                  <div className="rounded-full bg-blue-50 p-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={analytics.performance.averageScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tính nhất quán</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.performance.consistencyScore.toFixed(0)}%
                    </p>
                  </div>
                  <div className="rounded-full bg-green-50 p-3">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={analytics.performance.consistencyScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mức độ tham gia</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.performance.engagementLevel}%</p>
                  </div>
                  <div className="rounded-full bg-purple-50 p-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={analytics.performance.engagementLevel} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tốc độ học</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.performance.learningVelocity.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">bài/tuần</p>
                  </div>
                  <div className="rounded-full bg-orange-50 p-3">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Raw Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê hoạt động</CardTitle>
              <CardDescription>Dữ liệu thô về hoạt động học tập trong tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analytics.rawMetrics.totalScores}</p>
                  <p className="text-sm text-gray-600">Bài kiểm tra</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analytics.rawMetrics.totalSurveys}</p>
                  <p className="text-sm text-gray-600">Khảo sát</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{analytics.rawMetrics.totalQuizzes}</p>
                  <p className="text-sm text-gray-600">Quiz</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{analytics.rawMetrics.totalStudyTime}</p>
                  <p className="text-sm text-gray-600">Phút học</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{analytics.rawMetrics.activeDays}</p>
                  <p className="text-sm text-gray-600">Ngày tích cực</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Mô hình học tập</CardTitle>
              <CardDescription>Phân tích về thói quen và sở thích học tập</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Thời gian ưa thích:</span>
                    <Badge variant="outline">{getStudyTimeLabel(analytics.patterns.preferredStudyTime)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Độ khó ưa thích:</span>
                    <Badge variant="outline">{getDifficultyLabel(analytics.patterns.difficultyPreference)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Phong cách học:</span>
                    <Badge variant="outline">{getLearningStyleLabel(analytics.patterns.learningStyle)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Thời lượng tối ưu:</span>
                    <Badge variant="outline">{analytics.patterns.optimalSessionLength} phút</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium block mb-2">Môn mạnh:</span>
                    <div className="flex flex-wrap gap-1">
                      {analytics.patterns.subjectStrengths.map((subject, index) => (
                        <Badge key={index} className="bg-green-100 text-green-700">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium block mb-2">Môn cần cải thiện:</span>
                    <div className="flex flex-wrap gap-1">
                      {analytics.patterns.subjectWeaknesses.map((subject, index) => (
                        <Badge key={index} className="bg-red-100 text-red-700">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <span>Phân tích sâu từ AI</span>
                <Badge className={confidence.color}>
                  Độ tin cậy: {Math.round(analytics.aiAnalysis.confidenceScore * 100)}%
                </Badge>
              </CardTitle>
              <CardDescription>
                Phân tích được tạo vào {new Date(analytics.aiAnalysis.generatedAt).toLocaleString("vi-VN")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analytics.aiAnalysis.deepInsights}</p>
              </div>
            </CardContent>
          </Card>

          {analytics.aiAnalysis.riskFactors.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-700">
                  <AlertTriangle className="h-6 w-6" />
                  <span>Yếu tố rủi ro</span>
                </CardTitle>
                <CardDescription>Những điểm cần chú ý để cải thiện hiệu suất học tập</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analytics.aiAnalysis.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
                <span>Gợi ý cá nhân hóa</span>
              </CardTitle>
              <CardDescription>Những đề xuất cụ thể để cải thiện hiệu suất học tập</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.aiAnalysis.personalizedRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <div className="rounded-full bg-blue-100 p-2 flex-shrink-0">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <span>Dự đoán thành công</span>
              </CardTitle>
              <CardDescription>Dự báo hiệu suất dựa trên dữ liệu hiện tại</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analytics.aiAnalysis.successPredictions.nextExamScore}%
                  </div>
                  <p className="text-sm font-medium text-blue-800">Điểm kỳ thi tiếp theo</p>
                  <Progress value={analytics.aiAnalysis.successPredictions.nextExamScore} className="mt-3 h-2" />
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round(analytics.aiAnalysis.successPredictions.semesterGoalAchievement * 100)}%
                  </div>
                  <p className="text-sm font-medium text-green-800">Đạt mục tiêu học kỳ</p>
                  <Progress
                    value={analytics.aiAnalysis.successPredictions.semesterGoalAchievement * 100}
                    className="mt-3 h-2"
                  />
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {analytics.aiAnalysis.successPredictions.universityReadiness}%
                  </div>
                  <p className="text-sm font-medium text-purple-800">Sẵn sàng đại học</p>
                  <Progress value={analytics.aiAnalysis.successPredictions.universityReadiness} className="mt-3 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparative Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <span>So sánh với bạn bè</span>
              </CardTitle>
              <CardDescription>Vị trí của bạn so với các bạn cùng lớp và toàn quốc</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Xếp hạng trong lớp:</span>
                    <Badge className="bg-blue-100 text-blue-700">Top {100 - analytics.comparative.peerRanking}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Điểm TB lớp:</span>
                    <span className="font-semibold">{analytics.comparative.gradeAverage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Điểm TB toàn quốc:</span>
                    <span className="font-semibold">{analytics.comparative.nationalAverage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tiến bộ so với bạn bè</span>
                      <span className={analytics.comparative.improvementRate > 0 ? "text-green-600" : "text-red-600"}>
                        {analytics.comparative.improvementRate > 0 ? "+" : ""}
                        {analytics.comparative.improvementRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.max(0, Math.min(100, 50 + analytics.comparative.improvementRate))}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action-plan" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Short Term */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <Calendar className="h-5 w-5" />
                  <span>Ngắn hạn (1-2 tuần)</span>
                </CardTitle>
                <CardDescription>Hành động ngay lập tức</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analytics.aiAnalysis.actionPlan.shortTerm.map((action, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Medium Term */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <Calendar className="h-5 w-5" />
                  <span>Trung hạn (1-3 tháng)</span>
                </CardTitle>
                <CardDescription>Mục tiêu trung hạn</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analytics.aiAnalysis.actionPlan.mediumTerm.map((action, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Long Term */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700">
                  <Calendar className="h-5 w-5" />
                  <span>Dài hạn (3+ tháng)</span>
                </CardTitle>
                <CardDescription>Tầm nhìn dài hạn</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analytics.aiAnalysis.actionPlan.longTerm.map((action, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Star className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
