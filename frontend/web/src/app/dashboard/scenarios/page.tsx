'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Play,
  Trash2,
  Copy,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Loader2,
  DollarSign,
  Users,
  Percent,
  Package,
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'

export default function ScenariosPage() {
  const [showBuilder, setShowBuilder] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [parameters, setParameters] = useState({
    price_change: 0,
    staff_count: 0,
    marketing_budget: 0,
    inventory_change: 0,
  })

  const scenarios = [
    {
      id: 1,
      name: 'Price increase 10%',
      status: 'completed',
      createdAt: '2 hours ago',
      parameters: { price_change: 0.10 },
      results: {
        revenue: { value: '+$5,200/mo', trend: 'up', percent: '+8.7%' },
        churn: { value: '+1.2%', trend: 'down', percent: '+15%' },
        profit: { value: '+$4,100/mo', trend: 'up', percent: '+12.1%' },
      },
      confidence: 0.87,
    },
    {
      id: 2,
      name: 'Add 2 sales staff',
      status: 'completed',
      createdAt: '1 day ago',
      parameters: { staff_count: 2 },
      results: {
        revenue: { value: '+$8,400/mo', trend: 'up', percent: '+14.2%' },
        cost: { value: '+$12,000/mo', trend: 'down', percent: '+8.5%' },
        profit: { value: '-$3,600/mo', trend: 'down', percent: '-5.2%' },
      },
      confidence: 0.92,
    },
    {
      id: 3,
      name: 'Increase marketing 25%',
      status: 'running',
      createdAt: '10 minutes ago',
      parameters: { marketing_budget: 0.25 },
      results: null,
      confidence: null,
    },
    {
      id: 4,
      name: 'Launch enterprise tier',
      status: 'pending',
      createdAt: '1 hour ago',
      parameters: { new_tier: 'enterprise' },
      results: null,
      confidence: null,
    },
  ]

  const runScenario = () => {
    // Simulate scenario run
    console.log('Running scenario:', scenarioName, parameters)
    setShowBuilder(false)
    // Reset form
    setScenarioName('')
    setParameters({
      price_change: 0,
      staff_count: 0,
      marketing_budget: 0,
      inventory_change: 0,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Scenarios</h1>
            <p className="text-muted-foreground">Test what-if scenarios before making decisions</p>
          </div>
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Scenario
          </button>
        </div>

        {/* Scenario Builder Modal */}
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBuilder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6">Create New Scenario</h2>

              {/* Scenario Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Scenario Name</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="e.g., Price increase 15%"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Parameters */}
              <div className="space-y-6 mb-8">
                <h3 className="font-semibold text-lg">Parameters</h3>

                {/* Price Change */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <label className="font-medium">Price Change</label>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {parameters.price_change > 0 ? '+' : ''}{(parameters.price_change * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={parameters.price_change * 100}
                    onChange={(e) => setParameters({ ...parameters, price_change: Number(e.target.value) / 100 })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>-50%</span>
                    <span>+50%</span>
                  </div>
                </div>

                {/* Staff Count */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      <label className="font-medium">Additional Staff</label>
                    </div>
                    <span className="text-2xl font-bold text-purple-500">
                      {parameters.staff_count > 0 ? '+' : ''}{parameters.staff_count}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={parameters.staff_count}
                    onChange={(e) => setParameters({ ...parameters, staff_count: Number(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>-10</span>
                    <span>+10</span>
                  </div>
                </div>

                {/* Marketing Budget */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-pink-500" />
                      <label className="font-medium">Marketing Budget Change</label>
                    </div>
                    <span className="text-2xl font-bold text-pink-500">
                      {parameters.marketing_budget > 0 ? '+' : ''}{(parameters.marketing_budget * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={parameters.marketing_budget * 100}
                    onChange={(e) => setParameters({ ...parameters, marketing_budget: Number(e.target.value) / 100 })}
                    className="w-full accent-pink-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>-100%</span>
                    <span>+100%</span>
                  </div>
                </div>

                {/* Inventory */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-500" />
                      <label className="font-medium">Inventory Change</label>
                    </div>
                    <span className="text-2xl font-bold text-orange-500">
                      {parameters.inventory_change > 0 ? '+' : ''}{(parameters.inventory_change * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="200"
                    value={parameters.inventory_change * 100}
                    onChange={(e) => setParameters({ ...parameters, inventory_change: Number(e.target.value) / 100 })}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>-50%</span>
                    <span>+200%</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBuilder(false)}
                  className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={runScenario}
                  disabled={!scenarioName}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  Run Scenario
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Scenarios List */}
        <div className="space-y-4">
          {scenarios.map((scenario, i) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    scenario.status === 'completed' ? 'bg-green-500/20' :
                    scenario.status === 'running' ? 'bg-blue-500/20' :
                    'bg-muted'
                  }`}>
                    {scenario.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : scenario.status === 'running' ? (
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : (
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{scenario.name}</h3>
                    <p className="text-sm text-muted-foreground">Created {scenario.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {scenario.confidence && (
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                      {(scenario.confidence * 100).toFixed(0)}% confidence
                    </div>
                  )}
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    scenario.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    scenario.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {scenario.status}
                  </div>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Results */}
              {scenario.results && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  {Object.entries(scenario.results).map(([key, result]) => (
                    <div key={key} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {result.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-xs text-muted-foreground capitalize">{key}</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">{result.value}</div>
                      <div className={`text-sm font-medium ${result.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {result.percent}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
