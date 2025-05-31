"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Brain, Target, Clock, Star, Lightbulb, Zap } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface StudyMethod {
  _id: string
  subject: string
  methods: Array<{
    name: string
    description: string
    difficulty: "beginner" | "intermediate" | "advanced"
    timeRequired: string
    effectiveness: number
    personalizedTips: string[]
    resources: string[]
  }>
  targetAudience: string
  learningStyle: string
  createdAt: string
}

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
  "Triết học",
  "Giáo dục công dân",
]

const targetAudiences = [
  { value: "elementary", label: "Tiểu học" },
  { value: "middle_school", label: "Trung học cơ sở" },
  { value: "high_school", label: "Trung học phổ thông" },
  { value: "university", label: "Đại học" },
]

const learningStyles = [
  { value: "visual", label: "Thị giác (Visual)" },
  { value: "auditory", label: "Thính giác (Auditory)" },
  { value: "kinesthetic", label: "Vận động (Kinesthetic)" },
  { value: "reading", label: "Đọc viết (Reading/Writing)" },
]

export default function MethodsPage() {
  const [studyMethods, setStudyMethods] = useState<StudyMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedAudience, setSelectedAudience] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("")
  const [activeTab, setActiveTab] = useState("generate")

  useEffect(() => {
    fetchStudyMethods()
  }, [])

  const fetchStudyMethods = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/study-methods")
      if (response.ok) {
        const data = await response.json()
        setStudyMethods(data.studyMethods)
      }
    } catch (error) {
      console.error("Error fetching study methods:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateStudyMethods = async () => {
    if (!selectedSubject || !selectedAudience || !selectedStyle) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn đầy đủ môn học, đối tượng và phong cách học tập",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/study-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: selectedSubject,
          targetAudience: selectedAudience,
          learningStyle: selectedStyle,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStudyMethods([data.studyMethod, ...studyMethods])
        toast({
          title: "Thành công!",
          description: "Đã tạo phương pháp học tập mới từ AI",
        })
        // Reset form
        setSelectedSubject("")
        setSelectedAudience("")
        setSelectedStyle("")
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Có lỗi xảy ra khi tạo phương pháp học tập",
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

  const getAudienceLabel = (audience: string) => {
    const found = targetAudiences.find((a) => a.value === audience)
    return found ? found.label : audience
  }

  const getStyleLabel = (style: string) => {
    const found = learningStyles.find((s) => s.value === style)
    return found ? found.label : style
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phương pháp học tập</h1>
        <p className="text-gray-600">Khám phá và tạo ra các phương pháp học tập hiệu quả với AI</p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Tạo phương pháp mới</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Phương pháp đã lưu</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>Tạo phương pháp học tập với AI</span>
              </CardTitle>
              <CardDescription>
                AI sẽ phân tích và tạo ra các phương pháp học tập cá nhân hóa dựa trên thông tin bạn cung cấp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Môn học</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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
                  <label className="text-sm font-medium">Đối tượng</label>
                  <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đối tượng" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudiences.map((audience) => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phong cách học</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phong cách" />
                    </SelectTrigger>
                    <SelectContent>
                      {learningStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generateStudyMethods}
                disabled={isGenerating || !selectedSubject || !selectedAudience || !selectedStyle}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    AI đang tạo phương pháp...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Tạo phương pháp học tập với AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            </div>
          ) : studyMethods.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có phương pháp nào</h3>
                <p className="text-gray-500 text-center mb-4">Hãy tạo phương pháp học tập đầu tiên với AI</p>
                <Button onClick={() => setActiveTab("generate")}>
                  <Zap className="h-4 w-4 mr-2" />
                  Tạo ngay
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {studyMethods.map((studyMethod) => (
                <Card key={studyMethod._id} className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <span>{studyMethod.subject}</span>
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Badge variant="outline">{getAudienceLabel(studyMethod.targetAudience)}</Badge>
                        <Badge variant="outline">{getStyleLabel(studyMethod.learningStyle)}</Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Tạo ngày {new Date(studyMethod.createdAt).toLocaleDateString("vi-VN")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {studyMethod.methods.map((method, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg">{method.name}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getDifficultyColor(method.difficulty)}>
                                {getDifficultyLabel(method.difficulty)}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">{method.effectiveness}%</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">{method.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">Thời gian: {method.timeRequired}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Hiệu quả: </span>
                              <Progress value={method.effectiveness} className="flex-1 h-2" />
                            </div>
                          </div>

                          {method.personalizedTips.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium mb-2 flex items-center space-x-1">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                <span>Mẹo cá nhân hóa:</span>
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                {method.personalizedTips.map((tip, tipIndex) => (
                                  <li key={tipIndex}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {method.resources.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2 flex items-center space-x-1">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                <span>Tài liệu tham khảo:</span>
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                {method.resources.map((resource, resourceIndex) => (
                                  <li key={resourceIndex}>{resource}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
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
