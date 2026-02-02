import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
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

// Write models
async function writeModels(models: AIModel[]): Promise<void> {
  try {
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

async function reloadLLMCouncilConfig(): Promise<void> {
  console.log('Reloading LLM Council configuration...')
}

function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return '••••••••'
  return apiKey.substring(0, 4) + '••••••••••••••••' + apiKey.substring(apiKey.length - 4)
}

// GET /api/models/[id] - Get single model
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const models = await readModels()
    const model = models.find((m) => m.id === params.id)

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        model: {
          ...model,
          apiKey: maskApiKey(decryptApiKey(model.apiKey)),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching model:', error)
    return NextResponse.json({ error: 'Failed to fetch model' }, { status: 500 })
  }
}

// PATCH /api/models/[id] - Update model
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const models = await readModels()
    const modelIndex = models.findIndex((m) => m.id === params.id)

    if (modelIndex === -1) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // Update model fields
    models[modelIndex] = {
      ...models[modelIndex],
      ...body,
      id: params.id, // Ensure ID doesn't change
    }

    await writeModels(models)

    return NextResponse.json(
      {
        model: {
          ...models[modelIndex],
          apiKey: maskApiKey(decryptApiKey(models[modelIndex].apiKey)),
        },
        message: 'Model updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating model:', error)
    return NextResponse.json({ error: 'Failed to update model' }, { status: 500 })
  }
}

// DELETE /api/models/[id] - Delete model
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const models = await readModels()
    const filteredModels = models.filter((m) => m.id !== params.id)

    if (filteredModels.length === models.length) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    await writeModels(filteredModels)

    return NextResponse.json({ message: 'Model deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting model:', error)
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 })
  }
}
