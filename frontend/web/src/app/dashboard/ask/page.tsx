'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Brain,
  BarChart3,
  Loader2,
  Calendar,
  Target,
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  data?: {
    type: 'forecast' | 'insight' | 'scenario'
    content: any
  }
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI business analyst. I can help you forecast metrics, analyze trends, and run scenarios. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        'What will my revenue be next month?',
        'Show me customer growth forecast',
        'What if I increase prices by 15%?',
        'Predict churn rate for Q2',
      ],
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase()

    // Revenue forecast
    if (lowerMessage.includes('revenue')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Based on historical data and current trends, here's your revenue forecast for the next 30 days:",
        timestamp: new Date(),
        data: {
          type: 'forecast',
          content: {
            metric: 'Revenue',
            current: '$52,340',
            forecast: '$67,200',
            change: '+28.4%',
            confidence: '89%',
            insights: [
              'Strong upward trend detected (+12% week-over-week)',
              'Seasonal peak expected in 2 weeks',
              'Enterprise segment driving 60% of growth',
            ],
          },
        },
      }
    }

    // Customer growth
    if (lowerMessage.includes('customer')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Here's the customer growth forecast:",
        timestamp: new Date(),
        data: {
          type: 'forecast',
          content: {
            metric: 'New Customers',
            current: '1,842',
            forecast: '2,340',
            change: '+27.0%',
            confidence: '92%',
            insights: [
              'Marketing campaign showing 18% higher conversion',
              'Referral program contributing 240 new customers',
              'Organic growth rate increasing by 5% monthly',
            ],
          },
        },
      }
    }

    // Price scenario
    if (lowerMessage.includes('price') || lowerMessage.includes('increase')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I've simulated a price increase scenario. Here's what the model predicts:",
        timestamp: new Date(),
        data: {
          type: 'scenario',
          content: {
            scenario: '15% Price Increase',
            impacts: [
              { metric: 'Revenue', change: '+$7,800/mo', percent: '+14.9%' },
              { metric: 'Churn Rate', change: '+2.1%', percent: '+18%' },
              { metric: 'New Signups', change: '-82/mo', percent: '-12%' },
              { metric: 'Net Profit', change: '+$5,200/mo', percent: '+21%' },
            ],
            confidence: '87%',
            recommendation: 'Consider gradual 5-8% increase with grandfather clause for existing customers to minimize churn impact.',
          },
        },
      }
    }

    // Churn forecast
    if (lowerMessage.includes('churn')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Here's the churn rate forecast for Q2:",
        timestamp: new Date(),
        data: {
          type: 'forecast',
          content: {
            metric: 'Churn Rate',
            current: '3.2%',
            forecast: '2.8%',
            change: '-12.5%',
            confidence: '84%',
            insights: [
              'Onboarding improvements reducing early churn by 18%',
              'Support response time down 40%, improving retention',
              'Product engagement scores up 15% month-over-month',
            ],
          },
        },
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I can help you with that! Here are some things I can forecast for you:

• **Revenue & Growth** - Future revenue, MRR, ARR projections
• **Customer Metrics** - New customers, churn, LTV predictions
• **Product Analytics** - Feature adoption, engagement trends
• **Scenarios** - What-if analysis for business decisions
• **Trends** - Pattern detection and anomaly alerts

Try asking: "What will revenue be next month?" or "Show me customer growth forecast"`,
      timestamp: new Date(),
      suggestions: [
        'Forecast next quarter revenue',
        'Analyze customer retention trends',
        'What if I hire 2 more sales reps?',
      ],
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = simulateAIResponse(input)
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav />

      <div className="flex-1 flex flex-col max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Ask CogniTwin</h1>
          </div>
          <p className="text-muted-foreground">
            Ask me anything about your business metrics, forecasts, and what-if scenarios
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                      : 'bg-gradient-to-br from-green-500 to-emerald-500'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Sparkles className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-semibold text-sm">You</span>
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {/* Forecast Data Card */}
                    {message.data?.type === 'forecast' && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <span className="font-semibold">{message.data.content.metric}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {message.data.content.confidence}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Current</div>
                            <div className="text-lg font-bold">{message.data.content.current}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Forecast (30d)</div>
                            <div className="text-lg font-bold text-primary">{message.data.content.forecast}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Change</div>
                            <div className="text-lg font-bold text-green-500">{message.data.content.change}</div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-border space-y-2">
                          <div className="text-xs font-semibold text-muted-foreground uppercase">Key Insights</div>
                          {message.data.content.insights.map((insight: string, i: number) => (
                            <div key={i} className="flex gap-2 text-sm">
                              <span className="text-primary">•</span>
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scenario Data Card */}
                    {message.data?.type === 'scenario' && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-500" />
                            <span className="font-semibold">{message.data.content.scenario}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {message.data.content.confidence}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {message.data.content.impacts.map((impact: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-background rounded-lg">
                              <span className="text-sm">{impact.metric}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold">{impact.change}</span>
                                <span
                                  className={`text-sm ${
                                    impact.percent.startsWith('+') ? 'text-green-500' : 'text-red-500'
                                  }`}
                                >
                                  {impact.percent}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-border">
                          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Recommendation
                          </div>
                          <p className="text-sm">{message.data.content.recommendation}</p>
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="mt-4 space-y-2">
                        <div className="text-xs text-muted-foreground">Try asking:</div>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="p-4 bg-card border border-border rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-muted-foreground">Analyzing your data...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-border bg-background sticky bottom-0">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me about forecasts, metrics, or scenarios..."
                className="flex-1 px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                <span>Powered by AI Council</span>
              </div>
              <span>•</span>
              <span>89% average forecast accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
