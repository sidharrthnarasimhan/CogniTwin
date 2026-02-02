'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Filter,
  RefreshCw,
  Brain,
  Users,
  Briefcase,
  Code,
  DollarSign,
  Settings as SettingsIcon,
  GitBranch,
  Wrench,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sliders,
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'
import Link from 'next/link'

interface DebateMessage {
  role: string
  roleTitle: string
  icon: any
  color: string
  message: string
  timestamp: string
}

interface Insight {
  id: number
  type: string
  priority: string
  title: string
  summary: string
  finalRecommendation: string
  confidence: number
  debate: DebateMessage[]
  metrics: any
  generatedAt: string
}

export default function InsightsPage() {
  const [filterType, setFilterType] = useState('all')
  const [expandedDebate, setExpandedDebate] = useState<number | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<string>('2 hours ago')
  const [councilRoles, setCouncilRoles] = useState<any[]>([])

  // Load council roles with personalities
  const loadCouncilRoles = async () => {
    try {
      const response = await fetch('/api/council/roles')
      if (response.ok) {
        const data = await response.json()
        setCouncilRoles(data.roles || [])
      }
    } catch (error) {
      console.error('Failed to load council roles:', error)
    }
  }

  // Load on mount
  useEffect(() => {
    loadCouncilRoles()
  }, [])

  const roles = {
    ceo: { title: 'CEO', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
    cto: { title: 'CTO', icon: Code, color: 'from-purple-500 to-pink-500' },
    cfo: { title: 'CFO', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    'eng-manager': { title: 'Eng Manager', icon: GitBranch, color: 'from-orange-500 to-red-500' },
    'program-manager': { title: 'PM', icon: SettingsIcon, color: 'from-yellow-500 to-orange-500' },
    engineer: { title: 'Engineer', icon: Wrench, color: 'from-indigo-500 to-purple-500' },
  }

  const insights: Insight[] = [
    {
      id: 1,
      type: 'opportunity',
      priority: 'high',
      title: 'Enterprise Upsell Opportunity',
      summary:
        'Council identified significant revenue expansion opportunity in Enterprise segment with 40% higher engagement and 2.3x spend.',
      finalRecommendation:
        'Launch targeted upsell campaign with dedicated account managers and premium tier at $499/mo. Expected revenue lift: +$52k/mo with 340% ROI.',
      confidence: 0.89,
      debate: [
        {
          role: 'ceo',
          roleTitle: 'CEO',
          icon: Briefcase,
          color: 'from-blue-500 to-cyan-500',
          message:
            'This is a strategic priority. Enterprise segment shows 40% higher engagement and 2.3x spend. We need to capture this market before competitors do. The LTV data supports aggressive investment here.',
          timestamp: '10:00 AM',
        },
        {
          role: 'cfo',
          roleTitle: 'CFO',
          icon: DollarSign,
          color: 'from-green-500 to-emerald-500',
          message:
            'Financially compelling. ROI of 340% is excellent. However, we need to watch CAC carefully - enterprise sales cycles are longer. Budget allocation: $15k/mo for dedicated AMs, expect 4-month payback period.',
          timestamp: '10:02 AM',
        },
        {
          role: 'cto',
          roleTitle: 'CTO',
          icon: Code,
          color: 'from-purple-500 to-pink-500',
          message:
            'From a technical perspective, we need enterprise features: SSO, advanced permissions, API rate limits. Current infrastructure can handle 3x load, but we should implement feature flags for gradual rollout.',
          timestamp: '10:05 AM',
        },
        {
          role: 'program-manager',
          roleTitle: 'Program Manager',
          icon: SettingsIcon,
          color: 'from-yellow-500 to-orange-500',
          message:
            'Timeline concern: Enterprise features will take 6-8 weeks. We can start outreach now with roadmap commitments. Need to coordinate sales, engineering, and product teams. High cross-functional complexity.',
          timestamp: '10:08 AM',
        },
        {
          role: 'eng-manager',
          roleTitle: 'Eng Manager',
          icon: GitBranch,
          color: 'from-orange-500 to-red-500',
          message:
            'Team has capacity for this, but it will delay the mobile app by 3 weeks. SSO integration is 2 sprints, permissions is 1 sprint. We can parallelize with 2 engineers. Need QA resources for enterprise testing.',
          timestamp: '10:12 AM',
        },
        {
          role: 'engineer',
          roleTitle: 'Senior Engineer',
          icon: Wrench,
          color: 'from-indigo-500 to-purple-500',
          message:
            'SSO is straightforward with existing auth architecture. Permissions require database schema changes - moderate risk. I recommend feature branch deployment with beta testing group before full rollout.',
          timestamp: '10:15 AM',
        },
      ],
      metrics: {
        potential_revenue: '+$52k/mo',
        roi: '340%',
        timeline: '4-6 months',
      },
      generatedAt: '2 hours ago',
    },
    {
      id: 2,
      type: 'risk',
      priority: 'high',
      title: 'Starter Tier Churn Risk',
      summary:
        'Usage metrics declining 15% week-over-week in Starter tier. 127 customers at risk representing $8.2k MRR with 68% churn probability within 21 days.',
      finalRecommendation:
        'Immediate intervention required: Trigger proactive outreach campaign, offer 1-on-1 onboarding, and deploy in-app guidance. Budget: $3.2k for intervention, expected save rate: 60-70%.',
      confidence: 0.82,
      debate: [
        {
          role: 'cfo',
          roleTitle: 'CFO',
          icon: DollarSign,
          color: 'from-green-500 to-emerald-500',
          message:
            '$8.2k MRR at risk is significant - that is $98k annually. However, intervention cost of $3.2k gives us 500%+ ROI if we save even 60% of customers. We should act immediately.',
          timestamp: '2:00 PM',
        },
        {
          role: 'ceo',
          roleTitle: 'CEO',
          icon: Briefcase,
          color: 'from-blue-500 to-cyan-500',
          message:
            'Churn is a leading indicator of product-market fit issues. We need to understand the root cause, not just treat symptoms. This could indicate deeper problems with the Starter tier value proposition.',
          timestamp: '2:03 PM',
        },
        {
          role: 'program-manager',
          roleTitle: 'Program Manager',
          icon: SettingsIcon,
          color: 'from-yellow-500 to-orange-500',
          message:
            'I recommend a two-phase approach: (1) Immediate outreach to at-risk customers this week, (2) Long-term onboarding improvements over next month. We need customer success, product, and engineering coordination.',
          timestamp: '2:06 PM',
        },
        {
          role: 'cto',
          roleTitle: 'CTO',
          icon: Code,
          color: 'from-purple-500 to-pink-500',
          message:
            'Looking at the data, low usage correlates with incomplete onboarding. We should implement progressive disclosure and in-app tooltips. Also, our getting-started experience needs redesign - too complex.',
          timestamp: '2:10 PM',
        },
        {
          role: 'eng-manager',
          roleTitle: 'Eng Manager',
          icon: GitBranch,
          color: 'from-orange-500 to-red-500',
          message:
            'In-app guidance can be deployed in 1 sprint (2 weeks). We have a React component library for tooltips. Higher priority than some roadmap items given the financial impact. Team can start Monday.',
          timestamp: '2:14 PM',
        },
        {
          role: 'engineer',
          roleTitle: 'Senior Engineer',
          icon: Wrench,
          color: 'from-indigo-500 to-purple-500',
          message:
            'We can also implement usage tracking to identify drop-off points. Add event analytics to onboarding flow. This will help us measure intervention effectiveness and prevent future churn.',
          timestamp: '2:18 PM',
        },
      ],
      metrics: {
        at_risk_mrr: '$8.2k',
        intervention_cost: '$3.2k',
        expected_save_rate: '60-70%',
      },
      generatedAt: '4 hours ago',
    },
    {
      id: 3,
      type: 'recommendation',
      priority: 'medium',
      title: 'Add $99 Pricing Tier',
      summary:
        'Price sensitivity analysis reveals gap between Starter ($49) and Pro ($149). Modeling suggests $99 tier could capture additional segment.',
      finalRecommendation:
        'A/B test "Growth" tier at $99/mo with advanced analytics + 10 seats. Expected revenue: +$18.4k/mo, cannibalization risk < 8%.',
      confidence: 0.75,
      debate: [
        {
          role: 'ceo',
          roleTitle: 'CEO',
          icon: Briefcase,
          color: 'from-blue-500 to-cyan-500',
          message:
            'Pricing is strategic. The $100 gap is significant. I like this, but we need to be careful about brand perception. The tier needs clear differentiation so we do not confuse customers.',
          timestamp: 'Yesterday 3:00 PM',
        },
        {
          role: 'cfo',
          roleTitle: 'CFO',
          icon: DollarSign,
          color: 'from-green-500 to-emerald-500',
          message:
            '+$18.4k/mo is attractive, but cannibalization risk concerns me. We need strong A/B testing methodology. Also, consider annual prepay discount to lock in customers at the new tier.',
          timestamp: 'Yesterday 3:05 PM',
        },
        {
          role: 'cto',
          roleTitle: 'CTO',
          icon: Code,
          color: 'from-purple-500 to-pink-500',
          message:
            'Feature gating is already implemented, so technical lift is minimal. We just need to define the feature set for this tier. I recommend: advanced analytics, 10 seats, priority support.',
          timestamp: 'Yesterday 3:10 PM',
        },
        {
          role: 'program-manager',
          roleTitle: 'Program Manager',
          icon: SettingsIcon,
          color: 'from-yellow-500 to-orange-500',
          message:
            'We need pricing page redesign, sales enablement materials, and customer communication plan. Timeline: 2-3 weeks for full rollout. Suggest soft launch to existing trial users first.',
          timestamp: 'Yesterday 3:15 PM',
        },
      ],
      metrics: {
        potential_revenue: '+$18.4k/mo',
        addressable_segment: '~340 prospects',
        cannibalization_risk: '< 8%',
      },
      generatedAt: '1 day ago',
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5" />
      case 'risk':
        return <AlertCircle className="w-5 h-5" />
      case 'recommendation':
        return <Lightbulb className="w-5 h-5" />
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
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' }
    }
  }

  const handleRegenerateAnalysis = async () => {
    setIsRegenerating(true)
    try {
      // Load council role configurations with personalities
      const rolesResponse = await fetch('/api/council/roles')
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        console.log('Council roles with personalities:', rolesData.roles)
      }

      // Simulate AI council analysis generation
      // In a real implementation, this would call the LLM council backend
      // with the personality-enhanced prompts
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setLastGenerated('Just now')
      setTimeout(() => setLastGenerated('A few moments ago'), 60000)
    } catch (error) {
      console.error('Failed to regenerate analysis:', error)
    } finally {
      setIsRegenerating(false)
    }
  }

  const getPersonalityTraits = (roleId: string) => {
    const role = councilRoles.find((r) => r.id === roleId)
    if (!role || !role.traits || !role.personality) return []

    return role.traits.map((trait: any) => {
      const value = role.personality[trait.name] || 50
      let label = ''
      let intensity = ''

      if (value < 20) {
        label = trait.left
        intensity = 'Strongly'
      } else if (value < 40) {
        label = trait.left
        intensity = 'Moderately'
      } else if (value > 80) {
        label = trait.right
        intensity = 'Strongly'
      } else if (value > 60) {
        label = trait.right
        intensity = 'Moderately'
      } else {
        label = 'Balanced'
        intensity = ''
      }

      return {
        name: trait.name,
        label: intensity ? `${intensity} ${label}` : label,
        value,
        isBalanced: value >= 40 && value <= 60,
      }
    })
  }

  const filteredInsights = insights.filter(
    (insight) => filterType === 'all' || insight.type === filterType
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">AI Council</h1>
            </div>
            <p className="text-muted-foreground">
              Executive debate and analysis from 6 AI perspectives: CEO, CTO, CFO, Engineering Manager, Program Manager, Engineer
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/settings/council"
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
              Configure Roles
            </Link>
            <button
              onClick={handleRegenerateAnalysis}
              disabled={isRegenerating}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Analyzing with Council...' : 'Generate New Analysis'}
            </button>
          </div>
        </div>

        {/* Personality info banner */}
        {councilRoles.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Sliders className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-purple-500 mb-1">
                  Personality-Enhanced Analysis Active
                </div>
                <p className="text-sm text-muted-foreground">
                  Each council member's personality traits influence their perspective in the debate. View trait badges below each role's response to see their configured approach.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Regenerating notification */}
        {isRegenerating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3"
          >
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
            <div className="flex-1">
              <div className="font-medium text-primary mb-1">Regenerating council analysis...</div>
              <p className="text-sm text-muted-foreground">
                The AI Council is debating with their configured personality traits. This may take a moment.
              </p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <div className="flex gap-2 flex-wrap">
            {['all', 'opportunity', 'risk', 'recommendation'].map((type) => (
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
        <div className="space-y-6">
          {filteredInsights.map((insight, i) => {
            const colors = getColors(insight.type)
            const isExpanded = expandedDebate === insight.id

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-card border ${colors.border} rounded-xl overflow-hidden`}
              >
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text}`}>
                      {getIcon(insight.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{insight.title}</h3>
                        <div className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-lg text-xs font-medium uppercase`}>
                          {insight.priority} priority
                        </div>
                        <div className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-lg text-xs font-medium">
                          {insight.debate.length} voices in debate
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {insight.summary}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                    {Object.entries(insight.metrics).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-xs text-muted-foreground mb-1 capitalize">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="font-semibold text-lg">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Final Recommendation */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <div className="font-semibold text-primary">Final Recommendation (Council Consensus)</div>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {insight.finalRecommendation}
                    </p>
                  </div>

                  {/* Toggle Debate */}
                  <button
                    onClick={() => setExpandedDebate(isExpanded ? null : insight.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors w-full justify-center"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {isExpanded ? 'Hide' : 'View'} Council Debate ({insight.debate.length} messages)
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Debate Timeline */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-border bg-muted/20"
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <Brain className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold">Council Debate Timeline</h4>
                          <span className="text-sm text-muted-foreground">
                            (See how each role analyzed this issue)
                          </span>
                        </div>

                        <div className="space-y-4">
                          {insight.debate.map((msg, idx) => {
                            const Icon = msg.icon

                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-4"
                              >
                                <div className={`w-10 h-10 bg-gradient-to-br ${msg.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-semibold">{msg.roleTitle}</span>
                                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                                  </div>

                                  {/* Personality Traits */}
                                  {getPersonalityTraits(msg.role).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {getPersonalityTraits(msg.role).map((trait: any, traitIdx: number) => (
                                        <div
                                          key={traitIdx}
                                          className={`px-2 py-1 rounded text-xs font-medium ${
                                            trait.isBalanced
                                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                              : 'bg-primary/10 text-primary'
                                          }`}
                                        >
                                          {trait.label}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <div className="p-4 bg-card border border-border rounded-xl rounded-tl-none">
                                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                      {msg.message}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <div className="px-6 pb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-muted-foreground">
                      Confidence: <span className={`font-semibold ${colors.text}`}>
                        {(insight.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Generated {insight.generatedAt}</div>
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
