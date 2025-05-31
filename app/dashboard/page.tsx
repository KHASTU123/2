"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Trophy, TrendingUp, Calendar, Phone, Mail, BarChart3, Plus } from "lucide-react"
import ScoreInputForm from "@/components/score-input-form"
import ScoreAnalytics from "@/components/score-analytics"

interface User {
  _id: string
  name: string
  email: string
  phone: string
  avatar: string
  learningProgress: number
  joinedDate: string
}

export default function DashboardHome() {
  const [user, setUser] = useState<User | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [refreshAnalytics, setRefreshAnalytics] = useState(0)

  useEffect(() => {
    // Fetch user profile
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

    fetchProfile()

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Chào buổi sáng"
    if (hour < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const handleScoreAdded = () => {
    setRefreshAnalytics((prev) => prev + 1)
  }

  if (!user) {
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold">
              {getGreeting()}, {user.name}! 👋
            </h1>
            <p className="text-blue-100">Hôm nay là {formatDate(currentTime)}</p>
            <div className="flex items-center space-x-2 text-blue-100">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-lg">{formatTime(currentTime)}</span>
            </div>
          </div>
          <div className="mt-4 lg:mt-0">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
              Thành viên từ {new Date(user.joinedDate).getFullYear()}
            </Badge>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Thông tin cá nhân</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-shrink-0">
              <Image
                src={user.avatar || "/placeholder.svg"}
                alt="Avatar"
                width={100}
                height={100}
                className="rounded-full border-4 border-blue-100 shadow-md"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày tham gia</p>
                    <p className="font-medium">{new Date(user.joinedDate).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tiến độ học tập</p>
                    <p className="font-medium">{user.learningProgress}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Management Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-medium">Tiếp tục học</h3>
            <p className="text-sm text-gray-500">Bài học tiếp theo</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium">Xem tiến độ</h3>
            <p className="text-sm text-gray-500">Chi tiết học tập</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-medium">Thành tích</h3>
            <p className="text-sm text-gray-500">Huy hiệu đạt được</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-medium">Lịch học</h3>
            <p className="text-sm text-gray-500">Kế hoạch học tập</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
