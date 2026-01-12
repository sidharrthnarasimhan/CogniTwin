'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Filter,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  X,
  Brain,
  Target,
  Shield,
  BarChart3,
  Zap,
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'

export default function InsightsPage() {
  const [filterType, setFilterType] = useState('all')
  const [dismissedInsights, setDismissedInsights] = useState<number[]>([])

  const insights = [
    {
      id: 1,
      type: 'opportunity',
      priority: 'high',
      title: 'Revenue expansion opportunity detected',
      description:
        'Analysis shows customer cohort "Enterprise" has 40% higher engagement metrics and 2.3x average spend compared to other segments. LTV analysis suggests upsell potential of $18-24k per customer.',
      confidence: 0.89,
      impact: 'high',
      timeframe: '30-60 days',
      agents: ['Analyst', 'Strategist', 'Industry Expert'],
      actions: [
        'Launch targeted upsell campaign to Enterprise segment',
        'Create premium tier pricing at $499/mo',
        'Assign dedicated account managers',
      ],
      metrics: {
        potential_revenue: '+$52k/mo',
        conversion_estimate: '18-22%',
        roi: '340%',
      },
      generatedAt: '2 hours ago',
    },
    {
      id: 2,
      type: 'risk',
      priority: 'high',
      title: 'Churn risk increasing in Starter tier',
      description:
        'Usage metrics declining 15% week-over-week in Starter plan customers. Support ticket volume up 23%. Engagement score dropped from 7.2 to 5.8. Historical patterns indicate 68% churn probability within 21 days.',
      confidence: 0.82,
      impact: 'high',
      timeframe: '7-14 days',
      agents: ['Risk Officer', 'Operator', 'Analyst'],
      actions: [
        'Trigger proactive outreach campaign',
        'Offer 1-on-1 onboarding sessions',
        'Deploy in-app guidance tooltips',
        'Create getting-started video series',
      ],
      metrics: {
        at_risk_customers: '127',
        potential_loss: '-$8.2k MRR',
        intervention_roi: '520%',
      },
      generatedAt: '4 hours ago',
    },
    {
      id: 3,
      type: 'recommendation',
      priority: 'medium',
      title: 'Optimize pricing tier structure',
      description:
        'Price sensitivity analysis reveals gap between Starter ($49) and Pro ($149). 31% of prospects cite price as barrier. Modeling suggests $99 tier could capture additional segment with minimal cannibalization.',
      confidence: 0.75,
      impact: 'medium',
      timeframe: '60-90 days',
      agents: ['Strategist', 'Analyst', 'Industry Expert'],
      actions: [
        'A/B test $99 "Growth" tier',
        'Feature bundling: advanced analytics + 10 seats',
        'Grandfather existing customers at current rates',
      ],
      metrics: {
        potential_revenue: '+$18.4k/mo',
        addressable_segment: '~340 prospects',
        cannibalization_risk: '< 8%',
      },
      generatedAt: '6 hours ago',
    },
    {
      id: 4,
      type: 'opportunity',
      priority: 'medium',
      title: 'Seasonal demand surge predicted',
      description:
        'Historical patterns and external signals indicate 28-35% traffic increase in next 3 weeks. Competitor analysis shows market expansion. Inventory and capacity planning recommended.',
      confidence: 0.84,
      impact: 'medium',
      timeframe: '14-21 days',
      agents: ['Analyst', 'Industry Expert', 'Operator'],
      actions: [
        'Increase inventory by 25-30%',
        'Scale infrastructure capacity',
        'Prep seasonal marketing campaign',
        'Brief support team on volume spike',
      ],
      metrics: {
        expected_revenue_lift: '+$31k',
        confidence_interval: '±$4.2k',
        capacity_needed: '+2 support staff',
      },
      generatedAt: '1 day ago',
    },
    {
      id: 5,
      type: 'insight',
      priority: 'low',
      title: 'Support efficiency improving',
      description:
        'Average resolution time decreased 18% this month. Customer satisfaction scores up to 4.7/5. Knowledge base optimization and AI-assist features showing strong ROI.',
      confidence: 0.91,
      impact: 'low',
      timeframe: 'ongoing',
      agents: ['Operator', 'Analyst'],
      actions: [
        'Document best practices from top performers',
        'Expand AI-assist to more ticket categories',
      ],
      metrics: {
        time_saved: '42 hours/week',
        cost_reduction: '-$6.8k/mo',
        csat_improvement: '+0.4 points',
      },
      generatedAt: '2 days ago',
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Zap className="w-5 h-5" />
      case 'risk':
        return <AlertCircle className="w-5 h-5" />
      case 'recommendation':
        return <Lightbulb className="w-5 h-5" />
      case 'insight':
        return <CheckCircle2 className="w-5 h-5" />
      default:
        return <Sparkles className="w-5 h-5" />
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case 'opportunity':
        return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' }
      case 'risk':
        return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' }
      case 'recommendation':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' }
      case 'insight':
        return { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' }
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' }
    }
  }

  const filteredInsights = insights.filter(
    (insight) => !dismissedInsights.includes(insight.id) && (filterType === 'all' || insight.type === filterType)
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="p-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">AI Council Insights</h1>
            </div>
            <p className="text-muted-foreground">
              Multi-agent analysis from 6 specialized AI perspectives
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
            <RefreshCw className="w-5 h-5" />
            Generate New Insights
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <div className="flex gap-2 flex-wrap">
            {['all', 'opportunity', 'risk', 'recommendation', 'insight'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {filteredInsights.map((insight, i) => {
            const colors = getColors(insight.type)

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 bg-card border ${colors.border} rounded-xl`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text}`}>
                    {getIcon(insight.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{insight.title}</h3>
                          <div className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-lg text-xs font-medium uppercase`}>
                            {insight.priority} priority
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {insight.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setDismissedInsights([...dismissedInsights, insight.id])}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                      {Object.entries(insight.metrics).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs text-muted-foreground mb-1 capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="font-semibold">{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Recommended Actions */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Recommended Actions:</div>
                      <div className="space-y-2">
                        {insight.actions.map((action, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                            <span className="text-sm text-muted-foreground">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {insight.agents.slice(0, 3).map((agent, j) => (
                              <div
                                key={j}
                                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                                title={agent}
                              >
                                {agent.charAt(0)}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {insight.agents.length} agents
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Confidence: <span className={`font-semibold ${colors.text}`}>
                            {(insight.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Timeframe: <span className="font-semibold">{insight.timeframe}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{insight.generatedAt}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <ThumbsDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredInsights.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No insights to show</h3>
            <p className="text-muted-foreground">
              Try changing the filter or generate new insights
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
