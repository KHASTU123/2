"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  TrendingUp,
  BookOpen,
  Newspaper,
  User,
  Menu,
  LogOut,
  Brain,
  ClipboardList,
  BarChart3,
  Lightbulb,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const navItems = [
  { href: "/dashboard", label: "Trang chủ", icon: Home },
  { href: "/dashboard/progress", label: "Tiến độ học tập", icon: TrendingUp },
  { href: "/dashboard/methods", label: "Phương pháp học tập", icon: BookOpen },
  { href: "/dashboard/surveys", label: "Khảo sát", icon: ClipboardList },
  { href: "/dashboard/quizzes", label: "Quiz", icon: Brain },
  { href: "/dashboard/analytics", label: "Phân tích AI", icon: BarChart3 },
  { href: "/dashboard/recommendations", label: "Đề xuất AI", icon: Lightbulb },
  { href: "/dashboard/news", label: "Thông tin mới nhất", icon: Newspaper },
  { href: "/dashboard/account", label: "Tài khoản", icon: User },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      })
      router.push("/auth/login")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đăng xuất.",
        variant: "destructive",
      })
    }
  }

  const NavContent = () => (
    <>
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
      <div className="mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Đăng xuất
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 flex flex-col">
            <div className="py-4">
              <h2 className="text-lg font-semibold">Học tập Online</h2>
            </div>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Học tập Online</h2>
          </div>
          <div className="flex-1 flex flex-col justify-between p-4">
            <NavContent />
          </div>
        </div>
      </div>
    </>
  )
}
