"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Target, Award, BookOpen, Calendar } from "lucide-react"

interface Analytics {
  totalScores: number
  averageScore: number
  highestScore: number
  lowestScore: number
  subjectStats: Array<{
    subject: string
    average: number
    count: number
    highest: number
    lowest: number
  }>
  recentTrend: Array<{
    index: number
    percentage: number
    subject: string
    date: string
  }>
  typeStats: Array<{
    type: string
    average: number
    count: number
  }>
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

export default function ScoreAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/scores/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-50"
    if (percentage >= 80) return "text-blue-600 bg-blue-50"
    if (percentage >= 70) return "text-yellow-600 bg-yellow-50"
    if (percentage >= 60) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const getGradeName = (percentage: number) => {
    if (percentage >= 90) return "Xuất sắc"
    if (percentage >= 80) return "Giỏi"
    if (percentage >= 70) return "Khá"
    if (percentage >= 60) return "Trung bình"
    return "Yếu"
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Target className="h-4 w-4 text-gray-500" />
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics || analytics.totalScores === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dữ liệu điểm</h3>
          <p className="text-gray-500 text-center">Hãy thêm điểm số đầu tiên để xem phân tích</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số bài</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalScores}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageScore}%</p>
                  <Badge className={getGradeColor(analytics.averageScore)}>
                    {getGradeName(analytics.averageScore)}
                  </Badge>
                </div>
              </div>
              <div className="rounded-full bg-green-50 p-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm cao nhất</p>
                <p className="text-2xl font-bold text-green-600">{analytics.highestScore}%</p>
              </div>
              <div className="rounded-full bg-yellow-50 p-3">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Xu hướng</p>
                <div className="flex items-center space-x-2">
                  {analytics.recentTrend.length >= 2 &&
                    getTrendIcon(
                      analytics.recentTrend[analytics.recentTrend.length - 1]?.percentage || 0,
                      analytics.recentTrend[analytics.recentTrend.length - 2]?.percentage || 0,
                    )}
                  <p className="text-sm text-gray-600">
                    {analytics.recentTrend.length >= 2 ? "So với lần trước" : "Cần thêm dữ liệu"}
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-purple-50 p-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng điểm số</CardTitle>
            <CardDescription>Biểu đồ điểm số gần đây</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.recentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}%`, "Điểm"]}
                  labelFormatter={(label: any) => `Bài ${label}`}
                />
                <Line type="monotone" dataKey="percentage" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Thành tích theo môn học</CardTitle>
            <CardDescription>Điểm trung bình các môn học</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.subjectStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: any) => [`${value}%`, "Điểm TB"]} />
                <Bar dataKey="average" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Details */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết theo môn học</CardTitle>
          <CardDescription>Thống kê chi tiết cho từng môn học</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.subjectStats.map((subject, index) => (
              <div key={subject.subject} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{subject.subject}</h4>
                  <Badge className={getGradeColor(subject.average)}>{subject.average}%</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Số bài</p>
                    <p className="font-medium">{subject.count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cao nhất</p>
                    <p className="font-medium text-green-600">{subject.highest}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Thấp nhất</p>
                    <p className="font-medium text-red-600">{subject.lowest}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tiến độ</p>
                    <Progress value={subject.average} className="mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Type Distribution */}
      {analytics.typeStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Phân bố theo loại bài kiểm tra</CardTitle>
            <CardDescription>Thống kê theo loại bài kiểm tra</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.typeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type} (${count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.typeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {analytics.typeStats.map((type, index) => (
                  <div key={type.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded`}
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium capitalize">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{type.average}%</p>
                      <p className="text-sm text-gray-500">{type.count} bài</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
