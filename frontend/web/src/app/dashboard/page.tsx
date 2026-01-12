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
    <div className="min-h-screen bg-background">
      <DashboardNav />

      {/* Main Content */}
      <main className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Sidharrth</h1>
          <p className="text-muted-foreground">Here's what's happening with your business today</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-lg flex items-center justify-center`}>
                  <kpi.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {kpi.change}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-1">{kpi.title}</div>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Revenue Forecast</h2>
                <p className="text-sm text-muted-foreground">Actual vs Predicted (30 days)</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Scenario
              </button>
            </div>
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

          {/* AI Insights Panel */}
          <div className="p-6 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border border-border rounded-xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">AI Council Insights</h2>
            </div>
            <div className="space-y-4">
              {insights.slice(0, 2).map((insight, i) => (
                <div
                  key={i}
                  className="p-4 bg-card/50 border border-border rounded-lg hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-2">
                    {insight.type === 'opportunity' ? (
                      <Zap className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : insight.type === 'risk' ? (
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1">{insight.title}</div>
                      <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {insight.description}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-medium text-primary">{(insight.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              View All Insights
            </button>
          </div>
        </div>

        {/* Scenarios */}
        <div className="mt-6 p-6 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Recent Scenarios</h2>
              <p className="text-sm text-muted-foreground">Test what-if scenarios on your business</p>
            </div>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2">
              <Target className="w-4 h-4" />
              Create Scenario
            </button>
          </div>
          <div className="space-y-3">
            {scenarios.map((scenario, i) => (
              <div
                key={i}
                className="p-4 bg-muted/30 border border-border rounded-lg flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">{scenario.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {Object.entries(scenario.impact).map(([key, value], j) => (
                        <span key={j} className="mr-4">
                          {key}: <span className="font-medium text-foreground">{value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {scenario.confidence && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Confidence: </span>
                      <span className="font-medium text-primary">{(scenario.confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${scenario.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {scenario.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
