'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  Filter,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  X,
  Info,
  Zap,
  Activity,
  Shield,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { DashboardNav } from '@/components/dashboard-nav'

export default function AnomaliesPage() {
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([])

  const anomalies = [
    {
      id: 1,
      type: 'spike',
      severity: 'critical',
      title: 'Unusual churn spike detected',
      description: 'Churn rate increased by 340% in the last 24 hours. 47 customers cancelled subscriptions, compared to baseline of 12.',
      metric: 'Churn Rate',
      current: '8.2%',
      baseline: '2.4%',
      deviation: '+340%',
      confidence: 0.94,
      detectedAt: '12 minutes ago',
      rootCauses: [
        'Pricing change notification sent to 850 customers',
        'Service outage lasted 3.2 hours yesterday',
        'Support response time increased by 180%',
      ],
      recommendations: [
        'Pause pricing change rollout immediately',
        'Send apology email with 1-month credit offer',
        'Schedule emergency all-hands to address support backlog',
      ],
      affectedSegments: ['Starter Plan', 'Pro Plan'],
      timeline: [
        { time: '6h ago', value: 2.1, expected: 2.4 },
        { time: '5h ago', value: 2.3, expected: 2.4 },
        { time: '4h ago', value: 3.1, expected: 2.4 },
        { time: '3h ago', value: 5.2, expected: 2.4 },
        { time: '2h ago', value: 7.1, expected: 2.4 },
        { time: '1h ago', value: 8.0, expected: 2.4 },
        { time: 'now', value: 8.2, expected: 2.4 },
      ],
    },
    {
      id: 2,
      type: 'drop',
      severity: 'high',
      title: 'Revenue drop in Enterprise segment',
      description: 'Enterprise segment revenue declined 28% week-over-week. 3 major accounts downgraded plans.',
      metric: 'Enterprise Revenue',
      current: '$42,300',
      baseline: '$58,800',
      deviation: '-28%',
      confidence: 0.89,
      detectedAt: '2 hours ago',
      rootCauses: [
        '3 enterprise customers downgraded to Professional',
        'End of quarter budget constraints cited by 2 accounts',
        'Feature request (SSO) not delivered on promised timeline',
      ],
      recommendations: [
        'Immediate outreach to downgraded accounts',
        'Accelerate SSO feature development',
        'Offer custom annual contracts with Q1 2026 discount',
      ],
      affectedSegments: ['Enterprise'],
      timeline: [
        { time: 'Week 1', value: 58000, expected: 58000 },
        { time: 'Week 2', value: 59200, expected: 59000 },
        { time: 'Week 3', value: 58500, expected: 59000 },
        { time: 'Week 4', value: 42300, expected: 60000 },
      ],
    },
    {
      id: 3,
      type: 'pattern',
      severity: 'medium',
      title: 'Unusual traffic pattern detected',
      description: 'Traffic from mobile devices spiked 220% but conversion rate dropped 45%. Possible mobile UX issue.',
      metric: 'Mobile Conversion',
      current: '1.2%',
      baseline: '2.2%',
      deviation: '-45%',
      confidence: 0.82,
      detectedAt: '4 hours ago',
      rootCauses: [
        'Recent mobile app update (v2.1.4) introduced checkout bug',
        'Payment form not rendering correctly on iOS Safari',
        'Sign-up flow requires too many fields on mobile',
      ],
      recommendations: [
        'Rollback mobile app to v2.1.3 immediately',
        'Fix iOS Safari payment rendering issue',
        'Simplify mobile sign-up flow (A/B test 3 fields vs 7)',
      ],
      affectedSegments: ['Mobile Users', 'iOS Safari'],
      timeline: [
        { time: '12h ago', value: 2.1, expected: 2.2 },
        { time: '10h ago', value: 2.0, expected: 2.2 },
        { time: '8h ago', value: 1.8, expected: 2.2 },
        { time: '6h ago', value: 1.5, expected: 2.2 },
        { time: '4h ago', value: 1.2, expected: 2.2 },
      ],
    },
    {
      id: 4,
      type: 'trend',
      severity: 'low',
      title: 'Gradual support ticket increase',
      description: 'Support tickets up 35% over 2 weeks. Correlates with new feature launch.',
      metric: 'Support Tickets',
      current: '142/day',
      baseline: '105/day',
      deviation: '+35%',
      confidence: 0.76,
      detectedAt: '1 day ago',
      rootCauses: [
        'New analytics dashboard feature launched 2 weeks ago',
        'Documentation not comprehensive enough',
        'Feature discoverability issues',
      ],
      recommendations: [
        'Create video tutorial series for analytics dashboard',
        'Add in-app tooltips and guided tours',
        'Update help center with common questions',
      ],
      affectedSegments: ['All Users'],
      timeline: [
        { time: 'Week 1', value: 105, expected: 105 },
        { time: 'Week 2', value: 118, expected: 105 },
        { time: 'Week 3', value: 135, expected: 105 },
        { time: 'Week 4', value: 142, expected: 105 },
      ],
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-500',
          border: 'border-red-500/20',
          icon: 'bg-red-500',
        }
      case 'high':
        return {
          bg: 'bg-orange-500/10',
          text: 'text-orange-500',
          border: 'border-orange-500/20',
          icon: 'bg-orange-500',
        }
      case 'medium':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-500',
          border: 'border-yellow-500/20',
          icon: 'bg-yellow-500',
        }
      case 'low':
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-500',
          border: 'border-blue-500/20',
          icon: 'bg-blue-500',
        }
      default:
        return {
          bg: 'bg-muted',
          text: 'text-muted-foreground',
          border: 'border-border',
          icon: 'bg-muted',
        }
    }
  }

  const filteredAnomalies = anomalies.filter(
    (anomaly) =>
      !dismissedAnomalies.includes(anomaly.id) &&
      (filterSeverity === 'all' || anomaly.severity === filterSeverity)
  )

  const stats = [
    { label: 'Active Alerts', value: filteredAnomalies.length.toString(), color: 'text-red-500' },
    {
      label: 'Critical',
      value: anomalies.filter((a) => a.severity === 'critical').length.toString(),
      color: 'text-red-500',
    },
    {
      label: 'Avg Detection Time',
      value: '<2min',
      color: 'text-green-500',
    },
    { label: 'Accuracy', value: '94%', color: 'text-green-500' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Anomaly Detection</h1>
            </div>
            <p className="text-muted-foreground">
              Real-time pattern deviation alerts with Isolation Forest + Industry thresholds
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="text-sm">Configure Alerts</span>
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
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <div className="flex gap-2 flex-wrap">
            {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
              <button
                key={severity}
                onClick={() => setFilterSeverity(severity)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterSeverity === severity
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Anomalies List */}
        <div className="space-y-4">
          {filteredAnomalies.map((anomaly, i) => {
            const colors = getSeverityColor(anomaly.severity)

            return (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 bg-card border ${colors.border} rounded-xl`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center text-white`}
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{anomaly.title}</h3>
                          <div
                            className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-lg text-xs font-medium uppercase`}
                          >
                            {anomaly.severity}
                          </div>
                          <div className="text-xs text-muted-foreground">{anomaly.detectedAt}</div>
                        </div>
                        <p className="text-muted-foreground mb-4">{anomaly.description}</p>
                      </div>
                      <button
                        onClick={() => setDismissedAnomalies([...dismissedAnomalies, anomaly.id])}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Metric</div>
                        <div className="font-semibold">{anomaly.metric}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Current Value</div>
                        <div className={`font-semibold ${colors.text}`}>{anomaly.current}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Expected (Baseline)</div>
                        <div className="font-semibold">{anomaly.baseline}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Deviation</div>
                        <div className={`font-semibold ${colors.text}`}>{anomaly.deviation}</div>
                      </div>
                    </div>

                    {/* Timeline Chart */}
                    <div className="mb-4 p-4 bg-muted/10 rounded-lg">
                      <div className="text-sm font-medium mb-3">Detection Timeline</div>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={anomaly.timeline}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                          <XAxis dataKey="time" stroke="#666" fontSize={12} />
                          <YAxis stroke="#666" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#fff',
                            }}
                          />
                          <ReferenceLine
                            y={anomaly.timeline[0].expected}
                            stroke="#666"
                            strokeDasharray="3 3"
                            label="Expected"
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={colors.text === 'text-red-500' ? '#ef4444' : '#f59e0b'}
                            strokeWidth={3}
                            dot={{ fill: colors.text === 'text-red-500' ? '#ef4444' : '#f59e0b', r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Root Causes */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Identified Root Causes:
                      </div>
                      <div className="space-y-2">
                        {anomaly.rootCauses.map((cause, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm">
                            <AlertCircle className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                            <span className="text-muted-foreground">{cause}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Recommended Actions:
                      </div>
                      <div className="space-y-2">
                        {anomaly.recommendations.map((rec, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Confidence: <span className="font-semibold">{(anomaly.confidence * 100).toFixed(0)}%</span>
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Affected: <span className="font-semibold">{anomaly.affectedSegments.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                          Investigate
                        </button>
                        <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                          Snooze
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredAnomalies.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No anomalies detected</h3>
            <p className="text-muted-foreground">
              All metrics are within expected ranges. We'll alert you if anything unusual is detected.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
