"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ScoreInputFormProps {
  onScoreAdded: () => void
}

export default function ScoreInputForm({ onScoreAdded }: ScoreInputFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    score: "",
    maxScore: "",
    type: "quiz",
    difficulty: "medium",
    description: "",
  })

  const subjects = [
    "Toán học",
    "Vật lý",
    "Hóa học",
    "Sinh học",
    "Văn học",
    "Tiếng Anh",
    "Lịch sử",
    "Địa lý",
    "Tin học",
    "Khác",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          score: Number(formData.score),
          maxScore: Number(formData.maxScore),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Thành công!",
          description: "Điểm số đã được thêm vào hệ thống.",
        })
        setFormData({
          subject: "",
          score: "",
          maxScore: "",
          type: "quiz",
          difficulty: "medium",
          description: "",
        })
        setIsOpen(false)
        onScoreAdded()
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Có lỗi xảy ra khi thêm điểm.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPercentage = () => {
    const score = Number(formData.score)
    const maxScore = Number(formData.maxScore)
    if (score && maxScore && maxScore > 0) {
      return Math.round((score / maxScore) * 100)
    }
    return 0
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 80) return "bg-blue-500"
    if (percentage >= 70) return "bg-yellow-500"
    if (percentage >= 60) return "bg-orange-500"
    return "bg-red-500"
  }

  if (!isOpen) {
    return (
      <Card
        className="border-dashed border-2 hover:border-blue-300 transition-colors cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-blue-50 p-3 mb-4">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Thêm điểm mới</h3>
          <p className="text-sm text-gray-500 text-center">Nhấp để nhập điểm số của bạn</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span>Nhập điểm số</span>
        </CardTitle>
        <CardDescription>Thêm điểm số mới vào hệ thống theo dõi</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Môn học</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Loại bài kiểm tra</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Kiểm tra</SelectItem>
                  <SelectItem value="exam">Thi</SelectItem>
                  <SelectItem value="assignment">Bài tập</SelectItem>
                  <SelectItem value="practice">Luyện tập</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">Điểm đạt được</Label>
              <Input
                id="score"
                type="number"
                min="0"
                step="0.1"
                placeholder="8.5"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxScore">Điểm tối đa</Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                step="0.1"
                placeholder="10"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Phần trăm</Label>
              <div className="flex items-center h-10">
                {formData.score && formData.maxScore && (
                  <Badge className={`${getGradeColor(getPercentage())} text-white`}>{getPercentage()}%</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Độ khó</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="description"
              placeholder="Thêm ghi chú về bài kiểm tra..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Đang lưu..." : "Lưu điểm"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
