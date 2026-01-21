'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  Sparkles,
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { DashboardNav } from '@/components/dashboard-nav'

export default function Dashboard() {

  // Mock data
  const kpis = [
    {
      title: 'Revenue',
      value: '$52,340',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Customers',
      value: '1,842',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Orders',
      value: '348',
      change: '-2.1%',
      trend: 'down',
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Conversion',
      value: '3.2%',
      change: '+0.5%',
      trend: 'up',
      icon: Activity,
      color: 'from-orange-500 to-red-500',
    },
  ]

  const revenueData = [
    { date: 'Jan 1', actual: 42000, forecast: 41000, baseline: 40000 },
    { date: 'Jan 8', actual: 45000, forecast: 44000, baseline: 42000 },
    { date: 'Jan 15', actual: 48000, forecast: 47000, baseline: 44000 },
    { date: 'Jan 22', actual: 50000, forecast: 49500, baseline: 46000 },
    { date: 'Jan 29', actual: 52340, forecast: 52000, baseline: 48000 },
    { date: 'Feb 5', forecast: 54500, baseline: 50000 },
    { date: 'Feb 12', forecast: 57000, baseline: 52000 },
    { date: 'Feb 19', forecast: 59500, baseline: 54000 },
  ]

  const insights = [
    {
      type: 'opportunity',
      title: 'Revenue expansion opportunity detected',
      description: 'Customer cohort "Enterprise" shows 40% higher engagement. Consider upsell campaign.',
      confidence: 0.89,
      priority: 'high',
      agents: ['Analyst', 'Strategist', 'Industry Expert'],
    },
    {
      type: 'risk',
      title: 'Churn risk increasing in segment "Starter"',
      description: 'Usage metrics declining 15% week-over-week. Recommend proactive outreach.',
      confidence: 0.82,
      priority: 'high',
      agents: ['Risk Officer', 'Operator'],
    },
    {
      type: 'recommendation',
      title: 'Optimize pricing tier structure',
      description: 'Analysis suggests adding $149/mo tier between Starter and Pro could capture 18% more revenue.',
      confidence: 0.75,
      priority: 'medium',
      agents: ['Analyst', 'Strategist'],
    },
  ]

  const scenarios = [
    {
      name: 'Price increase 10%',
      status: 'completed',
      impact: { revenue: '+$5,200/mo', churn: '+1.2%' },
      confidence: 0.87,
    },
    {
      name: 'Add 2 sales staff',
      status: 'completed',
      impact: { revenue: '+$8,400/mo', cost: '+$12,000/mo' },
      confidence: 0.92,
    },
    {
      name: 'Launch enterprise tier',
      status: 'running',
      impact: { revenue: 'Calculating...', churn: 'Calculating...' },
      confidence: null,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D1117]">
      <DashboardNav />

      {/* Main Content */}
      <main className="py-12 px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Your business metrics at a glance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className="p-6 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</span>
                <span className={`text-xs font-medium ${
                  kpi.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <div className="mb-8 p-8 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Forecast</h2>
            <button className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-md text-sm font-medium transition-colors">
              New Scenario
            </button>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  fill="url(#colorActual)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#a855f7"
                  fill="url(#colorForecast)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stroke="#666"
                  fill="none"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4 Core Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* AI Forecasting */}
          <div className="p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:bg-gradient-to-br dark:from-blue-500/5 dark:to-cyan-500/5 border border-blue-500/20 rounded-lg hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Forecasting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prophet + LSTM models</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Predict revenue, demand, churn with 85-90% accuracy
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-green-600 dark:text-green-400">87.3%</span> accuracy
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                View Forecasts
              </button>
            </div>
          </div>

          {/* Anomaly Detection */}
          <div className="p-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:bg-gradient-to-br dark:from-orange-500/5 dark:to-red-500/5 border border-orange-500/20 rounded-lg hover:border-orange-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Anomaly Detection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time alerts</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Isolation Forest + industry thresholds catch issues early
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-orange-600 dark:text-orange-400">3</span> active alerts
              </div>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium transition-colors">
                View Alerts
              </button>
            </div>
          </div>

          {/* Cognitive Agents */}
          <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:bg-gradient-to-br dark:from-purple-500/5 dark:to-pink-500/5 border border-purple-500/20 rounded-lg hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Council</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">6 specialized agents</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Multi-agent debate system for trustworthy insights
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-purple-600 dark:text-purple-400">5</span> new insights
              </div>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors">
                View Insights
              </button>
            </div>
          </div>

          {/* Optimization */}
          <div className="p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:bg-gradient-to-br dark:from-green-500/5 dark:to-emerald-500/5 border border-green-500/20 rounded-lg hover:border-green-500/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Optimization</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Industry playbooks</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              300+ rules for inventory, pricing, staffing optimization
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-green-600 dark:text-green-400">12</span> recommendations
              </div>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors">
                View Playbooks
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-8 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Scenarios</h2>
            <button className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-md text-sm font-medium transition-colors">
              Create Scenario
            </button>
          </div>
          <div className="space-y-3">
            {scenarios.map((scenario, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-lg hover:border-[#0052CC] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white mb-1">{scenario.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {Object.entries(scenario.impact).slice(0, 2).map(([key, value], j) => (
                        <span key={j} className="mr-3">
                          {key}: <span className="font-medium">{value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-md text-xs font-medium ${
                    scenario.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {scenario.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
