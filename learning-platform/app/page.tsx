import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">Học tập Online</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Nền tảng học tập trực tuyến hiện đại với các khóa học chất lượng cao
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/auth/login">Đăng nhập</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/register">Đăng ký</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
