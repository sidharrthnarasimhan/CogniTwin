'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  Zap,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'

interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'custom'
  modelId: string
  apiKey: string
  description?: string
  status: 'active' | 'inactive' | 'testing'
  createdAt: string
  lastTested?: string
}

export default function ModelsSettingsPage() {
  const [models, setModels] = useState<AIModel[]>([
    {
      id: '1',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      modelId: 'gpt-4-turbo-preview',
      apiKey: 'sk-*********************demo',
      description: 'Default model for AI Council',
      status: 'active',
      createdAt: '2024-01-15',
      lastTested: '2024-01-23',
    },
  ])

  const [isAddingModel, setIsAddingModel] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({})
  const [testingModel, setTestingModel] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    provider: 'openai' as const,
    modelId: '',
    apiKey: '',
    description: '',
  })

  const providerOptions = [
    { value: 'openai', label: 'OpenAI', models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'] },
    { value: 'anthropic', label: 'Anthropic', models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'] },
    { value: 'google', label: 'Google', models: ['gemini-pro', 'gemini-pro-vision'] },
    { value: 'custom', label: 'Custom API', models: [] },
  ]

  const handleAddModel = () => {
    if (!formData.name || !formData.modelId || !formData.apiKey) {
      alert('Please fill in all required fields')
      return
    }

    const newModel: AIModel = {
      id: Date.now().toString(),
      name: formData.name,
      provider: formData.provider,
      modelId: formData.modelId,
      apiKey: formData.apiKey,
      description: formData.description,
      status: 'inactive',
      createdAt: new Date().toISOString().split('T')[0],
    }

    setModels([...models, newModel])
    setFormData({ name: '', provider: 'openai', modelId: '', apiKey: '', description: '' })
    setIsAddingModel(false)

    // Simulate API call to save configuration
    saveModelConfiguration(newModel)
  }

  const handleDeleteModel = (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      setModels(models.filter((m) => m.id !== id))
      // Simulate API call to delete configuration
      deleteModelConfiguration(id)
    }
  }

  const handleTestConnection = async (model: AIModel) => {
    setTestingModel(model.id)
    // Simulate API call to test connection
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setModels(
      models.map((m) =>
        m.id === model.id
          ? { ...m, status: 'active', lastTested: new Date().toISOString().split('T')[0] }
          : m
      )
    )
    setTestingModel(null)
  }

  const toggleModelStatus = (id: string) => {
    setModels(
      models.map((m) =>
        m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
      )
    )
    // Simulate API call to update status
    updateModelStatus(id, models.find((m) => m.id === id)?.status === 'active' ? 'inactive' : 'active')
  }

  // Simulate API functions (will be replaced with actual API calls)
  const saveModelConfiguration = async (model: AIModel) => {
    console.log('Saving model configuration:', model)
    // This will trigger backend to update LLM Council configuration
    await fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(model),
    })
  }

  const deleteModelConfiguration = async (id: string) => {
    console.log('Deleting model:', id)
    await fetch(`/api/models/${id}`, { method: 'DELETE' })
  }

  const updateModelStatus = async (id: string, status: string) => {
    console.log('Updating model status:', id, status)
    await fetch(`/api/models/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey({ ...showApiKey, [id]: !showApiKey[id] })
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">AI Models Configuration</h1>
            </div>
            <p className="text-muted-foreground">
              Manage AI models and API keys for the LLM Council and forecasting agents
            </p>
          </div>
          <button
            onClick={() => setIsAddingModel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Model
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="text-sm text-muted-foreground mb-2">Total Models</div>
            <div className="text-3xl font-bold text-primary">{models.length}</div>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="text-sm text-muted-foreground mb-2">Active Models</div>
            <div className="text-3xl font-bold text-green-500">
              {models.filter((m) => m.status === 'active').length}
            </div>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="text-sm text-muted-foreground mb-2">Providers</div>
            <div className="text-3xl font-bold text-blue-500">
              {new Set(models.map((m) => m.provider)).size}
            </div>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="text-sm text-muted-foreground mb-2">Last Updated</div>
            <div className="text-sm font-semibold text-muted-foreground">
              {models[0]?.lastTested || 'Never'}
            </div>
          </div>
        </div>

        {/* Add/Edit Model Form */}
        {isAddingModel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-card border border-border rounded-xl"
          >
            <h3 className="text-lg font-semibold mb-4">Add New Model</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Model Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., GPT-4 for Analysis"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Provider *</label>
                <select
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value as any, modelId: '' })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {providerOptions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Model ID *</label>
                {formData.provider !== 'custom' ? (
                  <select
                    value={formData.modelId}
                    onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a model</option>
                    {providerOptions
                      .find((p) => p.value === formData.provider)
                      ?.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.modelId}
                    onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                    placeholder="Custom model ID"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">API Key *</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddModel}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Model
              </button>
              <button
                onClick={() => setIsAddingModel(false)}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Models List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configured Models</h3>
          {models.map((model) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 bg-card border rounded-xl transition-all ${
                model.status === 'active'
                  ? 'border-green-500/50'
                  : model.status === 'testing'
                  ? 'border-blue-500/50'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold">{model.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        model.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : model.status === 'testing'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {model.status}
                    </span>
                  </div>
                  {model.description && (
                    <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Provider:</span>
                      <div className="font-medium capitalize">{model.provider}</div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Model ID:</span>
                      <div className="font-medium font-mono text-sm">{model.modelId}</div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">API Key:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {showApiKey[model.id] ? model.apiKey : '••••••••••••••••••••'}
                        </span>
                        <button
                          onClick={() => toggleApiKeyVisibility(model.id)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {showApiKey[model.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Last Tested:</span>
                      <div className="font-medium">{model.lastTested || 'Never'}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleTestConnection(model)}
                    disabled={testingModel === model.id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" />
                    {testingModel === model.id ? 'Testing...' : 'Test'}
                  </button>
                  <button
                    onClick={() => toggleModelStatus(model.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      model.status === 'active'
                        ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {model.status === 'active' ? (
                      <>
                        <X className="w-4 h-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteModel(model.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-500 mb-2">How it works</h4>
              <p className="text-sm text-muted-foreground mb-2">
                When you add a new AI model, the configuration is automatically saved and the LLM Council
                will use it for generating insights and forecasts.
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>API keys are securely encrypted before storage</li>
                <li>Test connections before activating models</li>
                <li>Active models are available to all AI agents in the council</li>
                <li>Changes take effect immediately without restarting the application</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
