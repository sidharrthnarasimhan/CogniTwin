'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, Sparkles, Settings, Bell, Search, Database, ChevronDown } from 'lucide-react'

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#0A0E27] border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center gap-10">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0052CC] to-[#0065FF] rounded-md flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#0052CC] to-[#0065FF] bg-clip-text text-transparent">
                CogniTwin
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-[#0052CC] dark:text-[#4C9AFF] bg-[#0052CC]/5 dark:bg-[#0052CC]/10'
                    : 'text-gray-700 dark:text-gray-300 hover:text-[#0052CC] dark:hover:text-[#4C9AFF] hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                Overview
              </Link>
              <Link
                href="/dashboard/test-data"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === '/dashboard/test-data'
                    ? 'text-[#0052CC] dark:text-[#4C9AFF] bg-[#0052CC]/5 dark:bg-[#0052CC]/10'
                    : 'text-gray-700 dark:text-gray-300 hover:text-[#0052CC] dark:hover:text-[#4C9AFF] hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Database className="w-4 h-4" />
                Playground
              </Link>
              <Link
                href="/dashboard/insights"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/dashboard/insights'
                    ? 'text-[#0052CC] dark:text-[#4C9AFF] bg-[#0052CC]/5 dark:bg-[#0052CC]/10'
                    : 'text-gray-700 dark:text-gray-300 hover:text-[#0052CC] dark:hover:text-[#4C9AFF] hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                Insights
              </Link>
              <Link
                href="/dashboard/ask"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === '/dashboard/ask'
                    ? 'text-[#0052CC] dark:text-[#4C9AFF] bg-[#0052CC]/5 dark:bg-[#0052CC]/10'
                    : 'text-gray-700 dark:text-gray-300 hover:text-[#0052CC] dark:hover:text-[#4C9AFF] hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Ask AI
              </Link>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5630] rounded-full" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0052CC] to-[#0065FF] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                SN
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
