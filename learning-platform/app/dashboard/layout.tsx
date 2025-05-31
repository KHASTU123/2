import type React from "react"
import DashboardNav from "@/components/dashboard-nav"
import ChatBot from "@/components/chat-bot"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="lg:pl-64">
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
          <h1 className="text-lg font-semibold">Học tập Online</h1>
          <DashboardNav />
        </div>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
      <ChatBot />
    </div>
  )
}
