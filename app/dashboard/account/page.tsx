"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Camera, Save, Plus, Trash2, Target, Award } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface UserProfile {
  _id: string
  name: string
  email: string
  phone: string
  avatar: string
  dateOfBirth?: string
  address?: string
  school?: string
  grade?: string
  parentPhone?: string
  universityAspirations?: Array<{
    university: string
    major: string
    priority: number
    requiredScore: number
    notes: string
  }>
  standardizedTests?: {
    vsat?: {
      math: number
      reading: number
      writing: number
      total: number
      date: string
    }
    ielts?: {
      listening: number
      reading: number
      writing: number
      speaking: number
      overall: number
      date: string
    }
  }
  learningPreferences?: {
    preferredSubjects: string[]
    learningStyle: string
    studyTime: string
    goals: string[]
  }
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

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
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updateData: Partial<UserProfile>) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast({
          title: "Thành công",
          description: data.message,
        })
      } else {
        toast({
          title: "Lỗi",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addUniversityAspiration = () => {
    const newAspiration = {
      university: "",
      major: "",
      priority: (user?.universityAspirations?.length || 0) + 1,
      requiredScore: 0,
      notes: "",
    }

    updateProfile({
      universityAspirations: [...(user?.universityAspirations || []), newAspiration],
    })
  }

  const removeUniversityAspiration = (index: number) => {
    const updated = user?.universityAspirations?.filter((_, i) => i !== index) || []
    updateProfile({ universityAspirations: updated })
  }

  const updateUniversityAspiration = (index: number, field: string, value: any) => {
    const updated = [...(user?.universityAspirations || [])]
    updated[index] = { ...updated[index], [field]: value }
    updateProfile({ universityAspirations: updated })
  }

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

  if (!user) {
    return <div>Không thể tải thông tin người dùng</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
        <p className="text-gray-600">Cập nhật thông tin cá nhân và mục tiêu học tập</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="aspirations">Nguyện vọng</TabsTrigger>
          <TabsTrigger value="tests">Điểm thi chuẩn</TabsTrigger>
          <TabsTrigger value="preferences">Sở thích học tập</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Thông tin cá nhân</span>
              </CardTitle>
              <CardDescription>Cập nhật thông tin cơ bản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Image
                    src={user.avatar || "/placeholder.svg"}
                    alt="Avatar"
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-gray-200"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                    onClick={() => {
                      // TODO: Implement avatar upload
                      toast({
                        title: "Tính năng đang phát triển",
                        description: "Upload avatar sẽ có trong phiên bản tiếp theo",
                      })
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {user.grade || "Chưa cập nhật lớp"}
                  </Badge>
                </div>
              </div>

              {/* Basic Info Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={user.dateOfBirth || ""}
                    onChange={(e) => setUser({ ...user, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Lớp</Label>
                  <Select value={user.grade || ""} onValueChange={(value) => setUser({ ...user, grade: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lớp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Lớp 10</SelectItem>
                      <SelectItem value="11">Lớp 11</SelectItem>
                      <SelectItem value="12">Lớp 12</SelectItem>
                      <SelectItem value="university">Đại học</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school">Trường học</Label>
                  <Input
                    id="school"
                    value={user.school || ""}
                    onChange={(e) => setUser({ ...user, school: e.target.value })}
                    placeholder="Tên trường học"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">SĐT phụ huynh</Label>
                  <Input
                    id="parentPhone"
                    value={user.parentPhone || ""}
                    onChange={(e) => setUser({ ...user, parentPhone: e.target.value })}
                    placeholder="Số điện thoại phụ huynh"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  value={user.address || ""}
                  onChange={(e) => setUser({ ...user, address: e.target.value })}
                  placeholder="Địa chỉ hiện tại"
                  rows={3}
                />
              </div>

              <Button onClick={() => updateProfile(user)} disabled={isSaving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Đang lưu..." : "Lưu thông tin"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aspirations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Nguyện vọng đại học</span>
                </div>
                <Button onClick={addUniversityAspiration} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm nguyện vọng
                </Button>
              </CardTitle>
              <CardDescription>Quản lý các nguyện vọng xét tuyển đại học</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.universityAspirations?.map((aspiration, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">Nguyện vọng {aspiration.priority}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeUniversityAspiration(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Trường đại học</Label>
                        <Input
                          value={aspiration.university}
                          onChange={(e) => updateUniversityAspiration(index, "university", e.target.value)}
                          placeholder="Tên trường đại học"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ngành học</Label>
                        <Input
                          value={aspiration.major}
                          onChange={(e) => updateUniversityAspiration(index, "major", e.target.value)}
                          placeholder="Tên ngành học"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Điểm chuẩn dự kiến</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={aspiration.requiredScore}
                          onChange={(e) => updateUniversityAspiration(index, "requiredScore", Number(e.target.value))}
                          placeholder="0.0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Thứ tự ưu tiên</Label>
                        <Select
                          value={aspiration.priority.toString()}
                          onValueChange={(value) => updateUniversityAspiration(index, "priority", Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                Nguyện vọng {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label>Ghi chú</Label>
                      <Textarea
                        value={aspiration.notes}
                        onChange={(e) => updateUniversityAspiration(index, "notes", e.target.value)}
                        placeholder="Ghi chú về nguyện vọng này..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có nguyện vọng nào</p>
                  <Button onClick={addUniversityAspiration} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm nguyện vọng đầu tiên
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* V-SAT Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Điểm V-SAT</span>
                </CardTitle>
                <CardDescription>Kết quả thi V-SAT (Vietnamese Scholastic Assessment Test)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Toán học</Label>
                    <Input
                      type="number"
                      max="800"
                      value={user.standardizedTests?.vsat?.math || ""}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          standardizedTests: {
                            ...user.standardizedTests,
                            vsat: {
                              ...user.standardizedTests?.vsat,
                              math: Number(e.target.value),
                            },
                          },
                        })
                      }
                      placeholder="0-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Đọc hiểu</Label>
                    <Input
                      type="number"
                      max="800"
                      value={user.standardizedTests?.vsat?.reading || ""}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          standardizedTests: {
                            ...user.standardizedTests,
                            vsat: {
                              ...user.standardizedTests?.vsat,
                              reading: Number(e.target.value),
                            },
                          },
                        })
                      }
                      placeholder="0-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Viết</Label>
                    <Input
                      type="number"
                      max="800"
                      value={user.standardizedTests?.vsat?.writing || ""}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          standardizedTests: {
                            ...user.standardizedTests,
                            vsat: {
                              ...user.standardizedTests?.vsat,
                              writing: Number(e.target.value),
                            },
                          },
                        })
                      }
                      placeholder="0-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tổng điểm</Label>
                    <Input
                      type="number"
                      max="2400"
                      value={user.standardizedTests?.vsat?.total || ""}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          standardizedTests: {
                            ...user.standardizedTests,
                            vsat: {
                              ...user.standardizedTests?.vsat,
                              total: Number(e.target.value),
                            },
                          },
                        })
                      }
                      placeholder="0-2400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ngày thi</Label>
                  <Input
                    type="date"
                    value={user.standardizedTests?.vsat?.date || ""}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        standardizedTests: {
                          ...user.standardizedTests,
                          vsat: {
                            ...user.standardizedTests?.vsat,
                            date: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* IELTS Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Điểm IELTS</span>
                </CardTitle>
                <CardDescription>Kết quả thi IELTS (International English Language Testing System)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Listening</Label>
                    <Input
                      type="number"
                      step="0.5"
                      max="9"
                      value={user.standardizedTests?.ielts?.listening || ""}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          standardizedTests: {
                            ...user.standardizedTests,
                            ielts: {
                              ...user.standardizedTests?.ielts,
                              listening: Number(e.target.value),
                            },
                          },
                        })
                      }
                      placeholder="0.0-9.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reading</Label>
                    <Input
                      type="number"
                      step="0.5"
                      max="9"
                      value={user.standardizedTests?.ielts?.reading || ""}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          standardizedTests: {
                            ...user.standardizedTests,
                            ielts: {
                              ...user.standardizedTests?.ielts,
                              reading: Number(e.target.value),
                            },
                          },
                        })
                      }
                      placeholder="0.0-9.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Writing</Label>
                    <Input
                      type="number"
                      step="0.5"
                      max="9"
                      value={user.standardizedTests?.ielts?.writing || ""}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          standardizedTests: {
                            ...user.standardizedTests,
                            ielts: {
                              ...user.standardizedTests?.ielts,
                              writing: Number(e.target.value),
                            },
                          },
                        })
                      }
                      placeholder="0.0-9.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Speaking</Label>
                    <Input
                      type="number"
                      step="0.5"
                      max="9"
                      value={user.standardizedTests?.ielts?.speaking || ""}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          standardizedTests: {
                            ...user.standardizedTests,
                            ielts: {
                              ...user.standardizedTests?.ielts,
                              speaking: Number(e.target.value),
                            },
                          },
                        })
                      }
                      placeholder="0.0-9.0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Overall</Label>
                    <Input
                      type="number"
                      step="0.5"
                      max="9"
                      value={user.standardizedTests?.ielts?.overall || ""}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          standardizedTests: {
                            ...user.standardizedTests,
                            ielts: {
                              ...user.standardizedTests?.ielts,
                              overall: Number(e.target.value),
                            },
                          },
                        })
                      }
                      placeholder="0.0-9.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày thi</Label>
                    <Input
                      type="date"
                      value={user.standardizedTests?.ielts?.date || ""}
                      onChange={(e) =>
                        setUser({
                          ...user,
                          standardizedTests: {
                            ...user.standardizedTests,
                            ielts: {
                              ...user.standardizedTests?.ielts,
                              date: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={() => updateProfile({ standardizedTests: user.standardizedTests })}
            disabled={isSaving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Đang lưu..." : "Lưu điểm thi"}
          </Button>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sở thích và phong cách học tập</CardTitle>
              <CardDescription>Cài đặt để AI có thể đưa ra gợi ý phù hợp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Phong cách học tập</Label>
                  <Select
                    value={user.learningPreferences?.learningStyle || ""}
                    onValueChange={(value) =>
                      setUser({
                        ...user,
                        learningPreferences: {
                          ...user.learningPreferences,
                          learningStyle: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phong cách học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Thị giác (Visual)</SelectItem>
                      <SelectItem value="auditory">Thính giác (Auditory)</SelectItem>
                      <SelectItem value="kinesthetic">Vận động (Kinesthetic)</SelectItem>
                      <SelectItem value="reading">Đọc viết (Reading/Writing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Thời gian học tốt nhất</Label>
                  <Select
                    value={user.learningPreferences?.studyTime || ""}
                    onValueChange={(value) =>
                      setUser({
                        ...user,
                        learningPreferences: {
                          ...user.learningPreferences,
                          studyTime: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Buổi sáng</SelectItem>
                      <SelectItem value="afternoon">Buổi chiều</SelectItem>
                      <SelectItem value="evening">Buổi tối</SelectItem>
                      <SelectItem value="night">Buổi đêm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Môn học yêu thích</Label>
                <Textarea
                  value={user.learningPreferences?.preferredSubjects?.join(", ") || ""}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      learningPreferences: {
                        ...user.learningPreferences,
                        preferredSubjects: e.target.value.split(", ").filter((s) => s.trim()),
                      },
                    })
                  }
                  placeholder="Toán, Vật lý, Hóa học... (phân cách bằng dấu phẩy)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Mục tiêu học tập</Label>
                <Textarea
                  value={user.learningPreferences?.goals?.join(", ") || ""}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      learningPreferences: {
                        ...user.learningPreferences,
                        goals: e.target.value.split(", ").filter((s) => s.trim()),
                      },
                    })
                  }
                  placeholder="Đỗ đại học, Cải thiện điểm số, Học bổng... (phân cách bằng dấu phẩy)"
                  rows={3}
                />
              </div>

              <Button
                onClick={() => updateProfile({ learningPreferences: user.learningPreferences })}
                disabled={isSaving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Đang lưu..." : "Lưu sở thích"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
