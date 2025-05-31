"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Award, BookOpen, Plus } from "lucide-react"
import ScoreInputForm from "@/components/score-input-form"
import ScoreAnalytics from "@/components/score-analytics"

interface UserProfile {
  name: string
  grade?: string
  universityAspirations?: Array<{
    university: string
    major: string
    priority: number
    requiredScore: number
  }>
  standardizedTests?: {
    vsat?: {
      total: number
      date: string
    }
    ielts?: {
      overall: number
      date: string
    }
  }
}

export default function ProgressPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [refreshAnalytics, setRefreshAnalytics] = useState(0)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleScoreAdded = () => {
    setRefreshAnalytics((prev) => prev + 1)
  }

  const getVSATProgress = () => {
    const total = user?.standardizedTests?.vsat?.total || 0
    return Math.round((total / 2400) * 100)
  }

  const getIELTSProgress = () => {
    const overall = user?.standardizedTests?.ielts?.overall || 0
    return Math.round((overall / 9) * 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tiến độ học tập</h1>
        <p className="text-gray-600">Theo dõi quá trình học tập và mục tiêu của bạn</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lớp học</p>
                <p className="text-2xl font-bold text-gray-900">{user?.grade || "Chưa cập nhật"}</p>
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
                <p className="text-sm font-medium text-gray-600">Nguyện vọng</p>
                <p className="text-2xl font-bold text-gray-900">{user?.universityAspirations?.length || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">V-SAT</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{user?.standardizedTests?.vsat?.total || 0}</p>
                  <Badge variant="secondary">{getVSATProgress()}%</Badge>
                </div>
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
                <p className="text-sm font-medium text-gray-600">IELTS</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{user?.standardizedTests?.ielts?.overall || 0}</p>
                  <Badge variant="secondary">{getIELTSProgress()}%</Badge>
                </div>
              </div>
              <div className="rounded-full bg-purple-50 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* University Aspirations */}
      {user?.universityAspirations && user.universityAspirations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Nguyện vọng đại học</span>
            </CardTitle>
            <CardDescription>Mục tiêu xét tuyển của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.universityAspirations.map((aspiration, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">NV {aspiration.priority}</Badge>
                      <h4 className="font-semibold">{aspiration.university}</h4>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Điểm chuẩn: {aspiration.requiredScore}</Badge>
                  </div>
                  <p className="text-gray-600">{aspiration.major}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Tiến độ chuẩn bị</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Management Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Phân tích điểm số</span>
          </TabsTrigger>
          <TabsTrigger value="input" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nhập điểm</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div key={refreshAnalytics}>
            <ScoreAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="input" className="space-y-6">
          <ScoreInputForm onScoreAdded={handleScoreAdded} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
