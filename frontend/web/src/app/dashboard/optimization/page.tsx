'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Play,
  ShoppingCart,
  UtensilsCrossed,
  Briefcase,
  Stethoscope,
  Truck,
  Code,
  Zap,
  BarChart3,
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'

export default function OptimizationPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('ecommerce')

  const industries = [
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
    { id: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
    { id: 'agency', label: 'Agency', icon: Briefcase },
    { id: 'clinic', label: 'Clinic', icon: Stethoscope },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'saas', label: 'SaaS', icon: Code },
  ]

  const playbooks: Record<string, any> = {
    ecommerce: {
      name: 'E-commerce Optimization Playbook',
      description: '80+ rules for inventory, pricing, and customer acquisition',
      rules: 83,
      categories: [
        {
          name: 'Inventory Management',
          icon: Package,
          color: 'from-blue-500 to-cyan-500',
          optimizations: [
            {
              title: 'Stockout Prevention',
              description: 'Identified 12 SKUs at risk of stockout within 7 days',
              impact: { metric: 'Prevented Lost Revenue', value: '+$18,400' },
              recommendation: 'Increase order quantities for high-velocity items by 25%',
              status: 'active',
              confidence: 0.92,
            },
            {
              title: 'Slow-Moving Inventory Reduction',
              description: '8 products with <1 unit/week velocity detected',
              impact: { metric: 'Capital Freed', value: '$24,200' },
              recommendation: 'Run 20% off flash sale for slow-moving SKUs',
              status: 'pending',
              confidence: 0.85,
            },
          ],
        },
        {
          name: 'Pricing Strategy',
          icon: DollarSign,
          color: 'from-green-500 to-emerald-500',
          optimizations: [
            {
              title: 'Dynamic Pricing Opportunity',
              description: 'Demand elasticity analysis suggests 8-12% price increase tolerance',
              impact: { metric: 'Revenue Increase', value: '+$6,200/mo' },
              recommendation: 'Test 10% price increase on top 5 products',
              status: 'recommended',
              confidence: 0.88,
            },
            {
              title: 'Bundle Optimization',
              description: 'Product affinity analysis found high-margin bundle opportunities',
              impact: { metric: 'AOV Increase', value: '+18%' },
              recommendation: 'Create "Complete Setup" bundle (3 products)',
              status: 'active',
              confidence: 0.79,
            },
          ],
        },
        {
          name: 'Customer Acquisition',
          icon: Users,
          color: 'from-purple-500 to-pink-500',
          optimizations: [
            {
              title: 'CAC Reduction Opportunity',
              description: 'Organic channel converting 2.3x better than paid ads',
              impact: { metric: 'CAC Reduction', value: '-$42/customer' },
              recommendation: 'Shift 30% of ad budget to SEO and content',
              status: 'recommended',
              confidence: 0.91,
            },
            {
              title: 'Referral Program Expansion',
              description: 'Referred customers have 40% higher LTV',
              impact: { metric: 'LTV Increase', value: '+$840/customer' },
              recommendation: 'Increase referral bonus from $10 to $25',
              status: 'active',
              confidence: 0.86,
            },
          ],
        },
      ],
    },
    restaurant: {
      name: 'Restaurant Optimization Playbook',
      description: '65+ rules for staffing, menu, and operations',
      rules: 67,
      categories: [
        {
          name: 'Staff Scheduling',
          icon: Clock,
          color: 'from-blue-500 to-cyan-500',
          optimizations: [
            {
              title: 'Labor Cost Optimization',
              description: 'Peak hours analysis suggests overstaffing during 2-4pm',
              impact: { metric: 'Labor Cost Savings', value: '-$3,200/mo' },
              recommendation: 'Reduce staff by 2 during weekday afternoons',
              status: 'active',
              confidence: 0.94,
            },
          ],
        },
        {
          name: 'Menu Engineering',
          icon: UtensilsCrossed,
          color: 'from-orange-500 to-red-500',
          optimizations: [
            {
              title: 'High-Margin Item Promotion',
              description: 'Items with 60%+ margin underrepresented in sales',
              impact: { metric: 'Margin Improvement', value: '+8.2%' },
              recommendation: 'Feature high-margin items in menu placement',
              status: 'recommended',
              confidence: 0.87,
            },
          ],
        },
      ],
    },
    agency: {
      name: 'Agency Optimization Playbook',
      description: '55+ rules for resource allocation and project profitability',
      rules: 57,
      categories: [
        {
          name: 'Resource Allocation',
          icon: Users,
          color: 'from-purple-500 to-pink-500',
          optimizations: [
            {
              title: 'Utilization Rate Improvement',
              description: '3 team members under 60% billable utilization',
              impact: { metric: 'Revenue Opportunity', value: '+$28,000/mo' },
              recommendation: 'Reassign to high-value projects or hire freeze',
              status: 'active',
              confidence: 0.89,
            },
          ],
        },
      ],
    },
    clinic: {
      name: 'Clinic Optimization Playbook',
      description: '70+ rules for appointments, staffing, and patient flow',
      rules: 72,
      categories: [
        {
          name: 'Appointment Scheduling',
          icon: Clock,
          color: 'from-green-500 to-emerald-500',
          optimizations: [
            {
              title: 'No-Show Reduction',
              description: 'SMS reminders reduce no-shows by 65%',
              impact: { metric: 'Revenue Recovery', value: '+$12,400/mo' },
              recommendation: 'Implement automated SMS reminder system',
              status: 'recommended',
              confidence: 0.93,
            },
          ],
        },
      ],
    },
    logistics: {
      name: 'Logistics Optimization Playbook',
      description: '75+ rules for routing, fleet, and delivery efficiency',
      rules: 78,
      categories: [
        {
          name: 'Route Optimization',
          icon: Truck,
          color: 'from-blue-500 to-cyan-500',
          optimizations: [
            {
              title: 'Fuel Cost Reduction',
              description: 'Route analysis identifies 18% inefficiency',
              impact: { metric: 'Fuel Savings', value: '-$8,200/mo' },
              recommendation: 'Implement dynamic routing algorithm',
              status: 'active',
              confidence: 0.91,
            },
          ],
        },
      ],
    },
    saas: {
      name: 'SaaS Optimization Playbook',
      description: '90+ rules for pricing, retention, and growth',
      rules: 92,
      categories: [
        {
          name: 'Pricing Optimization',
          icon: DollarSign,
          color: 'from-green-500 to-emerald-500',
          optimizations: [
            {
              title: 'Pricing Tier Gaps',
              description: 'Analysis suggests missing $99 tier opportunity',
              impact: { metric: 'MRR Increase', value: '+$18,400' },
              recommendation: 'Add "Growth" tier at $99/mo',
              status: 'recommended',
              confidence: 0.85,
            },
          ],
        },
        {
          name: 'Churn Reduction',
          icon: Users,
          color: 'from-red-500 to-orange-500',
          optimizations: [
            {
              title: 'Early Churn Prevention',
              description: 'Users who do not complete onboarding have 85% churn risk',
              impact: { metric: 'Retention Increase', value: '+12%' },
              recommendation: 'Trigger in-app onboarding nudges at day 3',
              status: 'active',
              confidence: 0.92,
            },
          ],
        },
      ],
    },
  }

  const currentPlaybook = playbooks[selectedIndustry]

  const stats = [
    { label: 'Active Optimizations', value: '24', color: 'text-green-500' },
    { label: 'Total Rules', value: currentPlaybook.rules.toString(), color: 'text-blue-500' },
    { label: 'Projected Impact', value: '+$84k/mo', color: 'text-purple-500' },
    { label: 'Avg ROI', value: '420%', color: 'text-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Operational Optimization</h1>
            </div>
            <p className="text-muted-foreground">
              Industry-specific playbooks with AI-powered recommendations
            </p>
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

        {/* Industry Selector */}
        <div className="mb-8">
          <div className="text-sm font-medium text-muted-foreground mb-3">Select Industry:</div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {industries.map((industry) => {
              const Icon = industry.icon
              return (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry.id)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedIndustry === industry.id
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-card border border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">{industry.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Playbook Header */}
        <div className="mb-6 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{currentPlaybook.name}</h2>
          </div>
          <p className="text-muted-foreground">{currentPlaybook.description}</p>
        </div>

        {/* Optimization Categories */}
        <div className="space-y-6">
          {currentPlaybook.categories.map((category: any, catIndex: number) => {
            const CategoryIcon = category.icon

            return (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    ({category.optimizations.length} optimizations)
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {category.optimizations.map((opt: any, optIndex: number) => (
                    <div
                      key={optIndex}
                      className={`p-6 bg-card border rounded-xl ${
                        opt.status === 'active'
                          ? 'border-green-500/50'
                          : opt.status === 'recommended'
                          ? 'border-blue-500/50'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold">{opt.title}</h4>
                        <div
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            opt.status === 'active'
                              ? 'bg-green-500/10 text-green-500'
                              : opt.status === 'recommended'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {opt.status}
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 text-sm">{opt.description}</p>

                      <div className="p-4 bg-muted/30 rounded-lg mb-4">
                        <div className="text-xs text-muted-foreground mb-1">{opt.impact.metric}</div>
                        <div className="text-2xl font-bold text-primary">{opt.impact.value}</div>
                      </div>

                      <div className="mb-4">
                        <div className="text-xs text-muted-foreground mb-2">Recommendation:</div>
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{opt.recommendation}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Confidence: <span className="font-semibold">{(opt.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <button
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            opt.status === 'active'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          {opt.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Activated
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl text-center">
          <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Want more optimization recommendations?</h3>
          <p className="text-muted-foreground mb-6">
            Our AI Council analyzes your data 24/7 to find new opportunities
          </p>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors mx-auto">
            <Sparkles className="w-5 h-5" />
            Generate New Insights
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
