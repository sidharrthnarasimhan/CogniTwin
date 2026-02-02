'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Briefcase,
  Code,
  DollarSign,
  Settings as SettingsIcon,
  GitBranch,
  Wrench,
  Save,
  AlertCircle,
  CheckCircle2,
  Sliders,
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'

interface PersonalityTrait {
  name: string
  left: string
  right: string
  description: string
}

interface CouncilRole {
  id: string
  title: string
  icon: any
  color: string
  description: string
  modelId: string | null
  prompt: string
  personality: {
    [key: string]: number // 0-100 scale
  }
  traits: PersonalityTrait[]
}

export default function CouncilSettingsPage() {
  const [availableModels, setAvailableModels] = useState<any[]>([])
  const [roles, setRoles] = useState<CouncilRole[]>([
    {
      id: 'ceo',
      title: 'CEO',
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
      description: 'Strategic vision, business growth, market opportunities',
      modelId: null,
      personality: {
        pace: 50, // Speed-focused vs Quality-focused
        risk: 50, // Conservative vs Aggressive
        focus: 50, // Short-term vs Long-term
      },
      traits: [
        {
          name: 'pace',
          left: 'Move Fast',
          right: 'Build Right',
          description: 'Prioritize speed to market vs building sustainable solutions',
        },
        {
          name: 'risk',
          left: 'Conservative',
          right: 'Bold & Aggressive',
          description: 'Play it safe vs take calculated risks for growth',
        },
        {
          name: 'focus',
          left: 'Short-term Wins',
          right: 'Long-term Vision',
          description: 'Immediate results vs sustainable competitive advantage',
        },
      ],
      prompt: `You are the CEO of the company. Your focus is on:
- Strategic vision and long-term growth
- Market opportunities and competitive positioning
- Revenue growth and business expansion
- High-level decision making and prioritization
- Stakeholder value and company direction`,
    },
    {
      id: 'cto',
      title: 'CTO',
      icon: Code,
      color: 'from-purple-500 to-pink-500',
      description: 'Technology strategy, architecture, innovation',
      modelId: null,
      personality: {
        innovation: 50, // Proven tech vs Bleeding-edge
        architecture: 50, // Pragmatic vs Purist
        debt: 50, // Ship fast vs Clean code
      },
      traits: [
        {
          name: 'innovation',
          left: 'Proven Tech',
          right: 'Cutting-edge',
          description: 'Stick with stable technologies vs adopt latest innovations',
        },
        {
          name: 'architecture',
          left: 'Pragmatic',
          right: 'Perfectionist',
          description: 'Good enough solutions vs architecturally perfect systems',
        },
        {
          name: 'debt',
          left: 'Ship Fast',
          right: 'Zero Tech Debt',
          description: 'Accept technical debt for speed vs maintain pristine codebase',
        },
      ],
      prompt: `You are the CTO of the company. Your focus is on:
- Technology strategy and technical vision
- System architecture and scalability
- Innovation and emerging technologies
- Technical debt and infrastructure
- Engineering excellence and best practices`,
    },
    {
      id: 'cfo',
      title: 'CFO',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      description: 'Financial planning, budgets, ROI, cost optimization',
      modelId: null,
      personality: {
        spending: 50, // Frugal vs Investment-focused
        planning: 50, // Flexible vs Strict
        roi: 50, // Patient vs Immediate returns
      },
      traits: [
        {
          name: 'spending',
          left: 'Cost-Conscious',
          right: 'Invest to Grow',
          description: 'Minimize expenses vs invest aggressively for growth',
        },
        {
          name: 'planning',
          left: 'Adaptive',
          right: 'Disciplined',
          description: 'Flexible with budget changes vs stick to the plan',
        },
        {
          name: 'roi',
          left: 'Quick Wins',
          right: 'Strategic Patience',
          description: 'Demand immediate ROI vs wait for long-term payoff',
        },
      ],
      prompt: `You are the CFO of the company. Your focus is on:
- Financial planning and analysis
- Budget allocation and cost optimization
- ROI and financial metrics
- Cash flow and runway management
- Investment decisions and resource allocation`,
    },
    {
      id: 'eng-manager',
      title: 'Engineering Manager',
      icon: GitBranch,
      color: 'from-orange-500 to-red-500',
      description: 'Team capacity, delivery timelines, technical execution',
      modelId: null,
      personality: {
        team: 50, // Push hard vs Protect team
        quality: 50, // Ship it vs Polish it
        process: 50, // Lightweight vs Rigorous
      },
      traits: [
        {
          name: 'team',
          left: 'High-Performance',
          right: 'Sustainable Pace',
          description: 'Push for maximum output vs protect team wellbeing',
        },
        {
          name: 'quality',
          left: 'Iterate Fast',
          right: 'Quality First',
          description: 'Ship working software quickly vs ensure high quality',
        },
        {
          name: 'process',
          left: 'Lean & Agile',
          right: 'Structured',
          description: 'Minimal process overhead vs thorough documentation and reviews',
        },
      ],
      prompt: `You are an Engineering Manager. Your focus is on:
- Team capacity and resource allocation
- Delivery timelines and sprint planning
- Technical execution and implementation
- Team productivity and velocity
- Risk management and dependencies`,
    },
    {
      id: 'program-manager',
      title: 'Program Manager',
      icon: SettingsIcon,
      color: 'from-yellow-500 to-orange-500',
      description: 'Project coordination, stakeholder alignment, deliverables',
      modelId: null,
      personality: {
        coordination: 50, // Hands-off vs Micromanage
        stakeholders: 50, // Protect team vs Please stakeholders
        scope: 50, // Flexible vs Strict
      },
      traits: [
        {
          name: 'coordination',
          left: 'Empower Teams',
          right: 'Hands-on',
          description: 'Trust teams to self-organize vs actively coordinate details',
        },
        {
          name: 'stakeholders',
          left: 'Team Advocate',
          right: 'Stakeholder-First',
          description: 'Shield team from requests vs accommodate stakeholder needs',
        },
        {
          name: 'scope',
          left: 'Adaptive',
          right: 'Scope Control',
          description: 'Accept scope changes vs strictly control requirements',
        },
      ],
      prompt: `You are a Program Manager. Your focus is on:
- Project coordination and cross-team alignment
- Stakeholder management and communication
- Deliverable tracking and milestones
- Risk mitigation and issue resolution
- Process optimization and efficiency`,
    },
    {
      id: 'engineer',
      title: 'Senior Engineer',
      icon: Wrench,
      color: 'from-indigo-500 to-purple-500',
      description: 'Implementation details, code quality, technical challenges',
      modelId: null,
      personality: {
        workstyle: 50, // Methodical vs Quick iteration
        quality: 50, // Pragmatic vs Perfectionist
        collaboration: 50, // Independent vs Collaborative
      },
      traits: [
        {
          name: 'workstyle',
          left: 'Rapid Prototyping',
          right: 'Methodical',
          description: 'Try things quickly vs plan thoroughly before coding',
        },
        {
          name: 'quality',
          left: 'Ship & Iterate',
          right: 'Craft Excellence',
          description: 'Working code is enough vs code must be exemplary',
        },
        {
          name: 'collaboration',
          left: 'Solo Focus',
          right: 'Team Player',
          description: 'Work independently vs constant collaboration and pairing',
        },
      ],
      prompt: `You are a Senior Engineer. Your focus is on:
- Implementation details and code quality
- Technical challenges and solutions
- System design and best practices
- Performance and optimization
- Maintainability and testability`,
    },
  ])

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchModels()
    loadRoleConfigurations()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      setAvailableModels(data.models || [])
    } catch (error) {
      console.error('Failed to fetch models:', error)
    }
  }

  const loadRoleConfigurations = async () => {
    try {
      const response = await fetch('/api/council/roles')
      if (response.ok) {
        const data = await response.json()
        if (data.roles) {
          setRoles(data.roles)
        }
      }
    } catch (error) {
      console.error('Failed to load role configurations:', error)
    }
  }

  const handleModelChange = (roleId: string, modelId: string) => {
    setRoles(
      roles.map((role) =>
        role.id === roleId ? { ...role, modelId: modelId || null } : role
      )
    )
  }

  const handlePersonalityChange = (roleId: string, traitName: string, value: number) => {
    setRoles(
      roles.map((role) =>
        role.id === roleId
          ? { ...role, personality: { ...role.personality, [traitName]: value } }
          : role
      )
    )
  }

  const handleSave = async () => {
    try {
      // Generate personality-enhanced prompts for each role before saving
      const rolesWithEnhancedPrompts = roles.map((role) => ({
        ...role,
        enhancedPrompt: generatePersonalityPrompt(role),
      }))

      await fetch('/api/council/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: rolesWithEnhancedPrompts }),
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save configurations:', error)
    }
  }

  const getPersonalityLabel = (trait: PersonalityTrait, value: number): string => {
    if (value < 33) return trait.left
    if (value > 66) return trait.right
    return 'Balanced'
  }

  const generatePersonalityPrompt = (role: CouncilRole): string => {
    const personalityInstructions = role.traits
      .map((trait) => {
        const value = role.personality[trait.name] || 50
        let instruction = ''

        if (value < 33) {
          instruction = `- You tend to be ${trait.left.toLowerCase()}: ${trait.description.split(' vs ')[0]}`
        } else if (value > 66) {
          instruction = `- You tend to be ${trait.right.toLowerCase()}: ${trait.description.split(' vs ')[1]}`
        } else {
          instruction = `- You maintain a balanced approach between ${trait.left.toLowerCase()} and ${trait.right.toLowerCase()}`
        }

        return instruction
      })
      .join('\n')

    return `${role.prompt}

**Your Personality Profile:**
${personalityInstructions}

When contributing to the debate, let these personality traits naturally influence your perspective, tone, and recommendations.`
  }

  const activeModels = availableModels.filter((m) => m.status === 'active')
  const assignedRoles = roles.filter((r) => r.modelId).length

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
              <h1 className="text-3xl font-bold">AI Council Configuration</h1>
            </div>
            <p className="text-muted-foreground">
              Assign AI models and customize personality traits for each role
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Configuration
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="text-sm text-muted-foreground mb-2">Total Roles</div>
            <div className="text-3xl font-bold text-primary">{roles.length}</div>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="text-sm text-muted-foreground mb-2">Assigned Roles</div>
            <div className="text-3xl font-bold text-green-500">{assignedRoles}</div>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="text-sm text-muted-foreground mb-2">Available Models</div>
            <div className="text-3xl font-bold text-blue-500">{activeModels.length}</div>
          </div>
        </div>

        {/* Save notification */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-green-500 font-medium">
              Configuration saved! Regenerate insights to see personality changes in action.
            </span>
          </motion.div>
        )}

        {/* Warning if no models */}
        {activeModels.length === 0 && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <div className="text-orange-500 font-medium mb-1">No active models found</div>
              <p className="text-sm text-muted-foreground">
                You need to add and activate AI models before assigning them to roles.{' '}
                <a
                  href="/dashboard/settings/models"
                  className="text-primary hover:underline font-medium"
                >
                  Go to Models Settings
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Roles Configuration */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold mb-4">Council Roles & Personalities</h3>
          {roles.map((role, index) => {
            const Icon = role.icon

            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold mb-1">{role.title}</h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      {role.modelId && (
                        <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium">
                          Assigned
                        </div>
                      )}
                    </div>

                    {/* Model Assignment */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Assigned AI Model
                      </label>
                      <select
                        value={role.modelId || ''}
                        onChange={(e) => handleModelChange(role.id, e.target.value)}
                        className="w-full max-w-md px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">No model assigned</option>
                        {activeModels.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} ({model.modelId})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Personality Traits */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Sliders className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold">Personality Traits</span>
                        <span className="text-xs text-muted-foreground">
                          (Customize how this role approaches analysis)
                        </span>
                      </div>

                      <div className="space-y-6">
                        {role.traits.map((trait) => {
                          const value = role.personality[trait.name] || 50

                          return (
                            <div key={trait.name} className="p-4 bg-muted/30 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="text-sm font-medium">{trait.left}</span>
                                    <span className="text-xs text-muted-foreground">↔</span>
                                    <span className="text-sm font-medium">{trait.right}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {trait.description}
                                  </p>
                                </div>
                                <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium ml-4">
                                  {getPersonalityLabel(trait, value)}
                                </div>
                              </div>

                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={value}
                                onChange={(e) =>
                                  handlePersonalityChange(role.id, trait.name, Number(e.target.value))
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                              />

                              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>0</span>
                                <span>50</span>
                                <span>100</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Role Prompt */}
                    <div className="p-4 bg-muted/20 rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground mb-2">
                        Full Role Prompt (with personality):
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {generatePersonalityPrompt(role)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* How it works */}
        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-500 mb-2">How Personality Traits Work</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>
                    <strong>Personality sliders customize each role's approach:</strong> A "Move Fast" CEO will prioritize speed while a "Build Right" CEO focuses on sustainable solutions.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>
                    <strong>Traits influence debate tone and recommendations:</strong> A cost-conscious CFO will push back on spending, while an investment-focused CFO will advocate for growth investments.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>
                    <strong>Experiment with different configurations:</strong> Try different personality combinations to see how the council's recommendations change. Save and regenerate insights to test.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>
                    <strong>Balanced (50) is the default:</strong> Middle values give balanced perspectives. Move sliders to extremes for more opinionated stances.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
