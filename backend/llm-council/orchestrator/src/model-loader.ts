/**
 * Dynamic Model Loader for LLM Council
 * Loads AI models from user configuration and provides unified interface
 */

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

const CONFIG_PATH = path.join(process.cwd(), '..', '..', 'frontend', 'web', 'config', 'ai-models.json')
const ENCRYPTION_KEY = process.env.MODEL_ENCRYPTION_KEY || 'default-key-change-in-production-32'
const ALGORITHM = 'aes-256-cbc'

export interface AIModel {
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

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ModelProvider {
  generate(messages: ModelMessage[], options?: GenerateOptions): Promise<string>
  test(): Promise<boolean>
}

export interface GenerateOptions {
  temperature?: number
  maxTokens?: number
}

/**
 * OpenAI Provider Implementation
 */
class OpenAIProvider implements ModelProvider {
  private client: OpenAI
  private modelId: string

  constructor(apiKey: string, modelId: string) {
    this.client = new OpenAI({ apiKey })
    this.modelId = modelId
  }

  async generate(messages: ModelMessage[], options: GenerateOptions = {}): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.modelId,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      })

      return response.choices[0]?.message?.content || ''
    } catch (error: any) {
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI generation failed: ${error.message}`)
    }
  }

  async test(): Promise<boolean> {
    try {
      await this.client.chat.completions.create({
        model: this.modelId,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      })
      return true
    } catch (error) {
      console.error('OpenAI test failed:', error)
      return false
    }
  }
}

/**
 * Anthropic Provider Implementation
 */
class AnthropicProvider implements ModelProvider {
  private client: Anthropic
  private modelId: string

  constructor(apiKey: string, modelId: string) {
    this.client = new Anthropic({ apiKey })
    this.modelId = modelId
  }

  async generate(messages: ModelMessage[], options: GenerateOptions = {}): Promise<string> {
    try {
      // Extract system message if present
      const systemMessage = messages.find((m) => m.role === 'system')
      const conversationMessages = messages.filter((m) => m.role !== 'system')

      const response = await this.client.messages.create({
        model: this.modelId,
        system: systemMessage?.content,
        messages: conversationMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      })

      return response.content[0]?.type === 'text' ? response.content[0].text : ''
    } catch (error: any) {
      console.error('Anthropic API error:', error)
      throw new Error(`Anthropic generation failed: ${error.message}`)
    }
  }

  async test(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.modelId,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      })
      return true
    } catch (error) {
      console.error('Anthropic test failed:', error)
      return false
    }
  }
}

/**
 * Decrypt API key from configuration
 */
function decryptApiKey(encryptedKey: string): string {
  if (!encryptedKey.includes(':')) {
    return encryptedKey // Not encrypted
  }

  try {
    const parts = encryptedKey.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = Buffer.from(parts[1], 'hex')

    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption failed:', error)
    return encryptedKey
  }
}

/**
 * Model Registry - Manages all configured AI models
 */
export class ModelRegistry {
  private models: Map<string, ModelProvider> = new Map()
  private modelConfigs: AIModel[] = []
  private lastLoadTime: number = 0
  private readonly RELOAD_INTERVAL = 60000 // 1 minute

  constructor() {
    this.loadModels()
  }

  /**
   * Load models from configuration file
   */
  async loadModels(): Promise<void> {
    try {
      // Check if we should reload based on time
      const now = Date.now()
      if (now - this.lastLoadTime < this.RELOAD_INTERVAL && this.models.size > 0) {
        return // Skip reload if too recent
      }

      if (!existsSync(CONFIG_PATH)) {
        console.warn('Model configuration file not found:', CONFIG_PATH)
        return
      }

      const data = await readFile(CONFIG_PATH, 'utf-8')
      const configs: AIModel[] = JSON.parse(data)

      this.modelConfigs = configs
      this.models.clear()

      // Load only active models
      for (const config of configs) {
        if (config.status !== 'active') {
          continue
        }

        try {
          const apiKey = decryptApiKey(config.apiKey)
          let provider: ModelProvider

          switch (config.provider) {
            case 'openai':
              provider = new OpenAIProvider(apiKey, config.modelId)
              break
            case 'anthropic':
              provider = new AnthropicProvider(apiKey, config.modelId)
              break
            default:
              console.warn(`Unsupported provider: ${config.provider}`)
              continue
          }

          this.models.set(config.id, provider)
          console.log(`Loaded model: ${config.name} (${config.modelId})`)
        } catch (error) {
          console.error(`Failed to load model ${config.name}:`, error)
        }
      }

      this.lastLoadTime = now
      console.log(`Loaded ${this.models.size} active models`)
    } catch (error) {
      console.error('Failed to load model configurations:', error)
    }
  }

  /**
   * Get a model by ID, or return the first active model
   */
  async getModel(modelId?: string): Promise<ModelProvider | null> {
    await this.loadModels() // Reload if needed

    if (modelId && this.models.has(modelId)) {
      return this.models.get(modelId)!
    }

    // Return first active model if no ID specified
    const firstModel = this.models.values().next()
    return firstModel.done ? null : firstModel.value
  }

  /**
   * Get all loaded models
   */
  getAllModels(): Map<string, ModelProvider> {
    return this.models
  }

  /**
   * Check if any models are loaded
   */
  hasModels(): boolean {
    return this.models.size > 0
  }

  /**
   * Force reload of models
   */
  async reload(): Promise<void> {
    this.lastLoadTime = 0
    await this.loadModels()
  }
}

// Global singleton instance
let registryInstance: ModelRegistry | null = null

/**
 * Get the global model registry
 */
export function getModelRegistry(): ModelRegistry {
  if (!registryInstance) {
    registryInstance = new ModelRegistry()
  }
  return registryInstance
}

/**
 * Reload the model registry
 */
export async function reloadModelRegistry(): Promise<void> {
  const registry = getModelRegistry()
  await registry.reload()
}
