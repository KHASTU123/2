"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronLeft, ChevronRight, Send, Brain, Star, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Question {
  id: string
  type: string
  question: string
  options?: string[]
  required: boolean
  category?: string
}

interface Survey {
  _id: string
  title: string
  description: string
  type: string
  questions: Question[]
  estimatedTime: number
}

interface Response {
  questionId: string
  answer: any
  timeSpent: number
  confidence?: number
}

export default function SurveyTakePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Response[]>([])
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  useEffect(() => {
    fetchSurvey()
  }, [params.id])

  useEffect(() => {
    setQuestionStartTime(new Date())
  }, [currentQuestion])

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSurvey(data.survey)
        setStartTime(new Date())
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải khảo sát",
          variant: "destructive",
        })
        router.push("/dashboard/surveys")
      }
    } catch (error) {
      console.error("Error fetching survey:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải khảo sát",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (answer: any, confidence?: number) => {
    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)

    const newResponse: Response = {
      questionId: survey!.questions[currentQuestion].id,
      answer,
      timeSpent,
      confidence,
    }

    setResponses((prev) => {
      const existing = prev.findIndex((r) => r.questionId === newResponse.questionId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = newResponse
        return updated
      }
      return [...prev, newResponse]
    })
  }

  const getCurrentResponse = () => {
    return responses.find((r) => r.questionId === survey!.questions[currentQuestion].id)
  }

  const canProceed = () => {
    const question = survey!.questions[currentQuestion]
    const response = getCurrentResponse()

    if (!question.required) return true
    if (!response) return false

    if (question.type === "text" && (!response.answer || response.answer.trim() === "")) {
      return false
    }

    return response.answer !== undefined && response.answer !== null && response.answer !== ""
  }

  const nextQuestion = () => {
    if (currentQuestion < survey!.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const submitSurvey = async () => {
    setIsSubmitting(true)
    try {
      const completionTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)

      const response = await fetch(`/api/surveys/${params.id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses,
          completionTime,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAiAnalysis(data.aiAnalysis)
        setShowResults(true)
        toast({
          title: "Hoàn thành!",
          description: "Cảm ơn bạn đã tham gia khảo sát. AI đang phân tích phản hồi của bạn.",
        })
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Có lỗi xảy ra khi gửi phản hồi",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi phản hồi. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: Question) => {
    const currentResponse = getCurrentResponse()

    switch (question.type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={Array.isArray(currentResponse?.answer) && currentResponse.answer.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = Array.isArray(currentResponse?.answer) ? currentResponse.answer : []
                    if (checked) {
                      handleAnswer([...currentAnswers, option])
                    } else {
                      handleAnswer(currentAnswers.filter((a: string) => a !== option))
                    }
                  }}
                />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case "single_choice":
        return (
          <RadioGroup value={currentResponse?.answer || ""} onValueChange={(value) => handleAnswer(value)}>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "rating":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">1 - Rất không đồng ý</span>
              <span className="text-sm text-gray-500">5 - Rất đồng ý</span>
            </div>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={currentResponse?.answer === rating ? "default" : "outline"}
                  size="lg"
                  className="w-12 h-12"
                  onClick={() => handleAnswer(rating)}
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>
        )

      case "text":
        return (
          <Textarea
            placeholder="Nhập câu trả lời của bạn..."
            value={currentResponse?.answer || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            rows={4}
          />
        )

      case "boolean":
        return (
          <RadioGroup
            value={currentResponse?.answer?.toString() || ""}
            onValueChange={(value) => handleAnswer(value === "true")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="yes" />
              <Label htmlFor="yes" className="cursor-pointer">
                Có
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="no" />
              <Label htmlFor="no" className="cursor-pointer">
                Không
              </Label>
            </div>
          </RadioGroup>
        )

      default:
        return <div>Loại câu hỏi không được hỗ trợ</div>
    }
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

  if (!survey) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy khảo sát</h2>
        <Button onClick={() => router.push("/dashboard/surveys")}>Quay lại danh sách</Button>
      </div>
    )
  }

  if (showResults && aiAnalysis) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-6 w-6" />
              <span>Hoàn thành khảo sát!</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Cảm ơn bạn đã tham gia. Dưới đây là phân tích AI về phản hồi của bạn.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <span>Phân tích AI</span>
              <Badge variant="secondary">Độ tin cậy: {Math.round((aiAnalysis.confidenceScore || 0) * 100)}%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Nhận xét chi tiết:</h3>
              <p className="text-gray-700 leading-relaxed">{aiAnalysis.insights}</p>
            </div>

            {aiAnalysis.personalityTraits && aiAnalysis.personalityTraits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Đặc điểm tính cách:</h3>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.personalityTraits.map((trait: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {aiAnalysis.learningStyle && (
              <div>
                <h3 className="font-semibold mb-3">Phong cách học tập:</h3>
                <Badge className="bg-purple-100 text-purple-700">
                  {aiAnalysis.learningStyle === "visual" && "Thị giác"}
                  {aiAnalysis.learningStyle === "auditory" && "Thính giác"}
                  {aiAnalysis.learningStyle === "kinesthetic" && "Vận động"}
                  {aiAnalysis.learningStyle === "reading" && "Đọc viết"}
                </Badge>
              </div>
            )}

            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Gợi ý cá nhân hóa:</h3>
                <ul className="space-y-2">
                  {aiAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={() => router.push("/dashboard/surveys")} size="lg">
            Quay lại danh sách khảo sát
          </Button>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / survey.questions.length) * 100
  const question = survey.questions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{survey.title}</CardTitle>
              <CardDescription>{survey.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{survey.estimatedTime} phút</span>
              </Badge>
              <Badge variant="outline">
                Câu {currentQuestion + 1}/{survey.questions.length}
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tiến độ</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {question.question}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </CardTitle>
          {question.category && (
            <Badge variant="secondary" className="w-fit">
              {question.category}
            </Badge>
          )}
        </CardHeader>
        <CardContent>{renderQuestion(question)}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Câu trước
        </Button>

        <div className="flex space-x-2">
          {currentQuestion === survey.questions.length - 1 ? (
            <Button onClick={submitSurvey} disabled={!canProceed() || isSubmitting} size="lg">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Hoàn thành
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextQuestion} disabled={!canProceed()}>
              Câu tiếp theo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
