import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

// Path to store model configurations (will be replaced with database later)
const CONFIG_PATH = path.join(process.cwd(), 'config', 'ai-models.json')

// Encryption key (should be in environment variable in production)
const ENCRYPTION_KEY = process.env.MODEL_ENCRYPTION_KEY || 'default-key-change-in-production-32'
const ALGORITHM = 'aes-256-cbc'

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

// Encrypt API key
function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16)
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

// Decrypt API key
function decryptApiKey(encryptedKey: string): string {
  const parts = encryptedKey.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32))
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// Read models from file
async function readModels(): Promise<AIModel[]> {
  try {
    if (!existsSync(CONFIG_PATH)) {
      return []
    }
    const data = await readFile(CONFIG_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading models:', error)
    return []
  }
}

// Write models to file
async function writeModels(models: AIModel[]): Promise<void> {
  try {
    // Ensure config directory exists
    const configDir = path.dirname(CONFIG_PATH)
    const { mkdir } = await import('fs/promises')
    await mkdir(configDir, { recursive: true })

    await writeFile(CONFIG_PATH, JSON.stringify(models, null, 2))

    // Trigger LLM Council configuration reload
    await reloadLLMCouncilConfig()
  } catch (error) {
    console.error('Error writing models:', error)
    throw error
  }
}

// Reload LLM Council configuration (will implement actual reload logic)
async function reloadLLMCouncilConfig(): Promise<void> {
  console.log('Reloading LLM Council configuration...')
  // This will trigger the LLM Council to reload its model configurations
  // In production, this could be a webhook, message queue, or direct API call
}

// GET /api/models - List all models
export async function GET(request: NextRequest) {
  try {
    const models = await readModels()

    // Return models with masked API keys
    const maskedModels = models.map((model) => ({
      ...model,
      apiKey: maskApiKey(decryptApiKey(model.apiKey)),
    }))

    return NextResponse.json({ models: maskedModels }, { status: 200 })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}

// POST /api/models - Create new model
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.provider || !body.modelId || !body.apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: name, provider, modelId, apiKey' },
        { status: 400 }
      )
    }

    const models = await readModels()

    // Create new model with encrypted API key
    const newModel: AIModel = {
      id: Date.now().toString(),
      name: body.name,
      provider: body.provider,
      modelId: body.modelId,
      apiKey: encryptApiKey(body.apiKey),
      description: body.description,
      status: body.status || 'inactive',
      createdAt: new Date().toISOString().split('T')[0],
    }

    models.push(newModel)
    await writeModels(models)

    // Return model with masked API key
    return NextResponse.json(
      {
        model: {
          ...newModel,
          apiKey: maskApiKey(body.apiKey),
        },
        message: 'Model created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 })
  }
}

// Mask API key for display
function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return '••••••••'
  return apiKey.substring(0, 4) + '••••••••••••••••' + apiKey.substring(apiKey.length - 4)
}
