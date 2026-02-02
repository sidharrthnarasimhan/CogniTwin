import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

const CONFIG_PATH = path.join(process.cwd(), 'config', 'ai-models.json')
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

// Read models
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

// Test OpenAI connection
async function testOpenAI(apiKey: string, modelId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 5,
      }),
    })

    if (response.ok) {
      return { success: true, message: 'OpenAI connection successful' }
    } else {
      const error = await response.json()
      return { success: false, message: error.error?.message || 'OpenAI connection failed' }
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Network error' }
  }
}

// Test Anthropic connection
async function testAnthropic(apiKey: string, modelId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 5,
      }),
    })

    if (response.ok) {
      return { success: true, message: 'Anthropic connection successful' }
    } else {
      const error = await response.json()
      return { success: false, message: error.error?.message || 'Anthropic connection failed' }
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Network error' }
  }
}

// Test Google connection
async function testGoogle(apiKey: string, modelId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Test connection' }] }],
        }),
      }
    )

    if (response.ok) {
      return { success: true, message: 'Google connection successful' }
    } else {
      const error = await response.json()
      return { success: false, message: error.error?.message || 'Google connection failed' }
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Network error' }
  }
}

// POST /api/models/[id]/test - Test model connection
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const models = await readModels()
    const model = models.find((m) => m.id === params.id)

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const apiKey = decryptApiKey(model.apiKey)
    let result: { success: boolean; message: string }

    // Test connection based on provider
    switch (model.provider) {
      case 'openai':
        result = await testOpenAI(apiKey, model.modelId)
        break
      case 'anthropic':
        result = await testAnthropic(apiKey, model.modelId)
        break
      case 'google':
        result = await testGoogle(apiKey, model.modelId)
        break
      default:
        result = { success: false, message: 'Unknown provider' }
    }

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        testedAt: new Date().toISOString(),
      },
      { status: result.success ? 200 : 400 }
    )
  } catch (error: any) {
    console.error('Error testing model:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to test model' },
      { status: 500 }
    )
  }
}
