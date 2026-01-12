'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Settings,
  ChevronDown,
  Activity,
  DollarSign,
  Users,
  ShoppingCart,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DashboardNav } from '@/components/dashboard-nav'

export default function ForecastsPage() {
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [timeRange, setTimeRange] = useState('30')

  const metrics = [
    { id: 'revenue', label: 'Revenue', icon: DollarSign, color: '#3b82f6' },
    { id: 'customers', label: 'New Customers', icon: Users, color: '#8b5cf6' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, color: '#ec4899' },
    { id: 'churn', label: 'Churn Rate', icon: Activity, color: '#f59e0b' },
  ]

  const forecastData = {
    revenue: [
      { date: 'Jan 1', actual: 42000, forecast: 41000, lower: 38000, upper: 44000 },
      { date: 'Jan 8', actual: 45000, forecast: 44000, lower: 41000, upper: 47000 },
      { date: 'Jan 15', actual: 48000, forecast: 47000, lower: 44000, upper: 50000 },
      { date: 'Jan 22', actual: 50000, forecast: 49500, lower: 46500, upper: 52500 },
      { date: 'Jan 29', actual: 52340, forecast: 52000, lower: 49000, upper: 55000 },
      { date: 'Feb 5', forecast: 54500, lower: 51000, upper: 58000 },
      { date: 'Feb 12', forecast: 57000, lower: 53500, upper: 60500 },
      { date: 'Feb 19', forecast: 59500, lower: 56000, upper: 63000 },
      { date: 'Feb 26', forecast: 62000, lower: 58500, upper: 65500 },
    ],
    customers: [
      { date: 'Jan 1', actual: 120, forecast: 118, lower: 100, upper: 136 },
      { date: 'Jan 8', actual: 135, forecast: 130, lower: 115, upper: 145 },
      { date: 'Jan 15', actual: 142, forecast: 140, lower: 125, upper: 155 },
      { date: 'Jan 22', actual: 156, forecast: 152, lower: 137, upper: 167 },
      { date: 'Jan 29', actual: 168, forecast: 165, lower: 150, upper: 180 },
      { date: 'Feb 5', forecast: 178, lower: 163, upper: 193 },
      { date: 'Feb 12', forecast: 192, lower: 177, upper: 207 },
      { date: 'Feb 19', forecast: 205, lower: 190, upper: 220 },
      { date: 'Feb 26', forecast: 218, lower: 203, upper: 233 },
    ],
  }

  const currentMetric = metrics.find(m => m.id === selectedMetric)

  const stats = [
    { label: 'Accuracy', value: '87.3%', change: '+2.1%', trend: 'up' },
    { label: 'Confidence', value: '92%', change: '+5%', trend: 'up' },
    { label: 'Last Updated', value: '2 hours ago', change: null, trend: null },
    { label: 'Data Points', value: '1,247', change: null, trend: null },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Forecasts</h1>
            <p className="text-muted-foreground">AI-powered predictions with 85%+ accuracy</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Last 30 days</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
            <button className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-card border border-border rounded-xl"
            >
              <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <div className={`flex items-center gap-1 text-sm font-medium mb-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Metric Selector */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all whitespace-nowrap ${
                selectedMetric === metric.id
                  ? 'bg-card border-2 border-primary shadow-lg'
                  : 'bg-card border border-border hover:border-primary/50'
              }`}
            >
              <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
              <span className="font-medium">{metric.label}</span>
            </button>
          ))}
        </div>

        {/* Main Chart */}
        <div className="p-6 bg-card border border-border rounded-xl mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">{currentMetric?.label} Forecast</h2>
              <p className="text-sm text-muted-foreground">30-day prediction with confidence intervals</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentMetric?.color }} />
                <span className="text-muted-foreground">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-muted-foreground">Forecast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-muted-foreground">Confidence Band</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={forecastData[selectedMetric as keyof typeof forecastData] || forecastData.revenue}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentMetric?.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={currentMetric?.color} stopOpacity={0} />
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
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="#666"
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="#666"
                fillOpacity={0.1}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke={currentMetric?.color}
                fill="url(#colorActual)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#a855f7"
                fill="url(#colorForecast)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights & Model Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-card border border-border rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <div className="font-medium mb-1">Strong upward trend detected</div>
                  <div className="text-sm text-muted-foreground">
                    Revenue forecast shows consistent 8-12% month-over-month growth
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <div className="font-medium mb-1">Seasonal pattern identified</div>
                  <div className="text-sm text-muted-foreground">
                    Historical data shows peaks in weeks 2 and 4 of each month
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                <div>
                  <div className="font-medium mb-1">High confidence period</div>
                  <div className="text-sm text-muted-foreground">
                    Next 7 days show 92% confidence due to strong historical patterns
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Model Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Algorithm</span>
                <span className="font-medium">Prophet + LSTM Ensemble</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Training Data</span>
                <span className="font-medium">180 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Trained</span>
                <span className="font-medium">2 hours ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MAPE</span>
                <span className="font-medium text-green-500">12.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">R² Score</span>
                <span className="font-medium text-green-500">0.87</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
