'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  analysis?: {
    impact: {
      revenue?: string
      churn?: string
      profit?: string
      customers?: string
    }
    confidence: number
    insights: string[]
    recommendations: string[]
  }
}

export default function ScenariosPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I can help you analyze business scenarios. Try asking questions like:\n\n• "What happens if the market drops by 15%?"\n• "How would a 20% price increase affect revenue?"\n• "What if we hire 3 more salespeople?"\n• "What happens if churn increases by 5%?"',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const analyzeScenario = async (question: string): Promise<Message['analysis']> => {
    // Simulate AI analysis - in production, this would call your LLM API
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Parse the question to extract scenario parameters
    const lowerQuestion = question.toLowerCase()

    let analysis: Message['analysis'] = {
      impact: {},
      confidence: 0.85,
      insights: [],
      recommendations: [],
    }

    // Market down scenario
    if (lowerQuestion.includes('market') && (lowerQuestion.includes('down') || lowerQuestion.includes('drop'))) {
      const percentMatch = question.match(/(\d+)%/)
      const percent = percentMatch ? parseInt(percentMatch[1]) : 15

      analysis = {
        impact: {
          revenue: `-$${(52340 * percent / 100).toFixed(0)}/mo`,
          customers: `-${Math.floor(1842 * percent / 100)} customers`,
          profit: `-${percent + 2}%`,
        },
        confidence: 0.87,
        insights: [
          `${percent}% market decline would reduce revenue by approximately $${(52340 * percent / 100).toFixed(0)}/month`,
          `Customer acquisition would slow by ${Math.floor(percent * 0.8)}%`,
          `Existing customers may increase churn by ${(percent * 0.3).toFixed(1)}%`,
          `Industry benchmarks suggest recovery takes 4-6 months`,
        ],
        recommendations: [
          'Increase customer retention efforts immediately',
          'Reduce variable costs by 10-15% to maintain margins',
          'Focus on high-value customer segments',
          'Diversify revenue streams to reduce market dependency',
          'Build cash reserves for 6-month runway',
        ],
      }
    }
    // Price increase scenario
    else if (lowerQuestion.includes('price') && lowerQuestion.includes('increase')) {
      const percentMatch = question.match(/(\d+)%/)
      const percent = percentMatch ? parseInt(percentMatch[1]) : 20

      analysis = {
        impact: {
          revenue: `+$${(52340 * percent / 100 * 0.7).toFixed(0)}/mo`,
          churn: `+${(percent * 0.4).toFixed(1)}%`,
          profit: `+${(percent * 0.9).toFixed(0)}%`,
        },
        confidence: 0.82,
        insights: [
          `${percent}% price increase could boost revenue by $${(52340 * percent / 100 * 0.7).toFixed(0)}/month`,
          `Expected churn increase: ${(percent * 0.4).toFixed(1)}% (${Math.floor(1842 * percent * 0.004)} customers)`,
          `Price elasticity analysis suggests ${(100 - percent * 1.5).toFixed(0)}% of customers will accept increase`,
          `Competitor pricing is currently 12% higher, giving room for adjustment`,
        ],
        recommendations: [
          'Test with small customer segment first (10-15%)',
          'Grandfather existing customers for 3 months',
          'Add premium features to justify increase',
          'Implement gradual rollout over 2-3 months',
          'Monitor churn metrics daily during rollout',
        ],
      }
    }
    // Hiring scenario
    else if (lowerQuestion.includes('hire') || lowerQuestion.includes('salespeople') || lowerQuestion.includes('staff')) {
      const numberMatch = question.match(/(\d+)/)
      const count = numberMatch ? parseInt(numberMatch[1]) : 3

      analysis = {
        impact: {
          revenue: `+$${(8400 * count).toFixed(0)}/mo`,
          customers: `+${Math.floor(42 * count)} customers/mo`,
          profit: `-$${(12000 * count - 8400 * count).toFixed(0)}/mo initially`,
        },
        confidence: 0.89,
        insights: [
          `Each salesperson costs ~$12k/mo (salary + benefits + overhead)`,
          `Expected revenue lift: $8,400/mo per rep after 3-month ramp-up`,
          `ROI turns positive at month 4-5 based on historical data`,
          `Total investment: $${(12000 * count * 3).toFixed(0)} before break-even`,
        ],
        recommendations: [
          `Hire ${count} sales reps if you have $${(12000 * count * 6).toFixed(0)}+ runway`,
          'Focus on enterprise segment for faster ROI',
          'Implement structured onboarding (reduces ramp from 5mo to 3mo)',
          'Set quota at $25k MRR per rep after ramp',
          'Consider contract/part-time initially to test',
        ],
      }
    }
    // Churn increase scenario
    else if (lowerQuestion.includes('churn')) {
      const percentMatch = question.match(/(\d+)%/)
      const percent = percentMatch ? parseInt(percentMatch[1]) : 5

      analysis = {
        impact: {
          revenue: `-$${(52340 * percent / 100).toFixed(0)}/mo`,
          customers: `-${Math.floor(1842 * percent / 100)} customers/mo`,
          profit: `-${(percent * 1.2).toFixed(0)}%`,
        },
        confidence: 0.91,
        insights: [
          `${percent}% churn increase = ${Math.floor(1842 * percent / 100)} additional customers lost monthly`,
          `Revenue impact: -$${(52340 * percent / 100).toFixed(0)}/month`,
          `LTV decreases from $2,100 to $${(2100 * (1 - percent / 100)).toFixed(0)}`,
          `Acquisition efficiency drops significantly (LTV/CAC ratio)`,
        ],
        recommendations: [
          'Launch immediate win-back campaign for at-risk customers',
          'Analyze exit surveys to identify root causes',
          'Improve onboarding to increase activation rate',
          'Implement early warning system based on usage metrics',
          'Offer retention discounts for annual prepay',
        ],
      }
    }
    // Generic scenario
    else {
      analysis = {
        impact: {
          revenue: 'Analyzing...',
          profit: 'Analyzing...',
        },
        confidence: 0.75,
        insights: [
          'I analyzed your scenario based on current business metrics',
          'The impact depends on market conditions and execution',
          'Historical data suggests moderate correlation with similar changes',
        ],
        recommendations: [
          'Try asking more specific questions about metrics',
          'Include percentages or numbers for detailed analysis',
          'Ask about market, pricing, hiring, or churn scenarios',
        ],
      }
    }

    return analysis
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isAnalyzing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsAnalyzing(true)

    // Analyze the scenario
    const analysis = await analyzeScenario(input)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: `I've analyzed your scenario. Here's what I found:`,
      timestamp: new Date(),
      analysis,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsAnalyzing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const suggestedQuestions = [
    'What happens if the market drops by 15%?',
    'How would a 20% price increase affect revenue?',
    'What if we hire 3 more salespeople?',
    'What happens if churn increases by 5%?',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#0A0E27] dark:via-[#0D1117] dark:to-[#0A0E27]">
      <DashboardNav />

      <div className="max-w-5xl mx-auto h-[calc(100vh-64px)] flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Scenario Analysis
              </h1>
              <p className="text-sm text-muted-foreground">
                Ask me anything about your business scenarios
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'assistant' ? (
                  <div className="max-w-3xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-white dark:bg-[#161B22] rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {message.content}
                          </p>

                          {message.analysis && (
                            <div className="mt-4 space-y-4">
                              {/* Impact Metrics */}
                              <div className="grid grid-cols-2 gap-3">
                                {Object.entries(message.analysis.impact).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700"
                                  >
                                    <div className="text-xs text-muted-foreground capitalize mb-1">
                                      {key}
                                    </div>
                                    <div className={`text-lg font-bold ${
                                      value?.startsWith('+')
                                        ? 'text-green-600 dark:text-green-400'
                                        : value?.startsWith('-')
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-gray-900 dark:text-gray-100'
                                    }`}>
                                      {value}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Confidence */}
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-muted-foreground">
                                  Confidence: <span className="font-semibold text-green-600 dark:text-green-400">
                                    {(message.analysis.confidence * 100).toFixed(0)}%
                                  </span>
                                </span>
                              </div>

                              {/* Insights */}
                              {message.analysis.insights.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                                    Key Insights
                                  </div>
                                  <ul className="space-y-2">
                                    {message.analysis.insights.map((insight, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                                      >
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                                        <span>{insight}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Recommendations */}
                              {message.analysis.recommendations.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    <Target className="w-4 h-4 text-blue-500" />
                                    Recommendations
                                  </div>
                                  <ul className="space-y-2">
                                    {message.analysis.recommendations.map((rec, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                                      >
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 ml-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-lg">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl rounded-tr-none p-4 shadow-lg">
                      <p className="text-white whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 mr-1 text-right">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mt-1">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-white dark:bg-[#161B22] rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                  <p className="text-gray-600 dark:text-gray-400">
                    Analyzing scenario...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions (only show when no messages yet) */}
        {messages.length === 1 && (
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2 ml-1">Try asking:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => setInput(question)}
                  className="px-3 py-1.5 text-sm bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-full hover:border-purple-500 dark:hover:border-purple-500 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative bg-white dark:bg-[#161B22] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 focus-within:border-purple-500 dark:focus-within:border-purple-500 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any business scenario... (e.g., 'What if the market drops by 15%?')"
              rows={1}
              className="w-full px-6 py-4 bg-transparent resize-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 max-h-32"
              style={{ minHeight: '56px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isAnalyzing}
              className="absolute right-3 bottom-3 p-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 ml-1">
            Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-xs">Shift + Enter</kbd> for new line
          </div>
        </form>
      </div>
    </div>
  )
}
