'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, Sparkles, Settings, Bell, Search } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">CogniTwin</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Overview
              </Link>
              <Link
                href="/dashboard/forecasts"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/dashboard/forecasts' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Forecasts
              </Link>
              <Link
                href="/dashboard/scenarios"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/dashboard/scenarios' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Scenarios
              </Link>
              <Link
                href="/dashboard/insights"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/dashboard/insights' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Insights
              </Link>
              <Link
                href="/dashboard/ask"
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  pathname === '/dashboard/ask' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Ask AI
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <ThemeToggle />
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              SN
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
