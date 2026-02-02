import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const CONFIG_PATH = path.join(process.cwd(), 'config', 'council-roles.json')

// GET /api/council/roles - Get role configurations
export async function GET(request: NextRequest) {
  try {
    if (!existsSync(CONFIG_PATH)) {
      return NextResponse.json({ roles: [] }, { status: 200 })
    }

    const data = await readFile(CONFIG_PATH, 'utf-8')
    const roles = JSON.parse(data)

    return NextResponse.json({ roles }, { status: 200 })
  } catch (error) {
    console.error('Error fetching council roles:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

// POST /api/council/roles - Save role configurations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.roles || !Array.isArray(body.roles)) {
      return NextResponse.json(
        { error: 'Invalid request: roles array required' },
        { status: 400 }
      )
    }

    // Ensure config directory exists
    const configDir = path.dirname(CONFIG_PATH)
    const { mkdir } = await import('fs/promises')
    await mkdir(configDir, { recursive: true })

    // Save roles configuration
    await writeFile(CONFIG_PATH, JSON.stringify(body.roles, null, 2))

    return NextResponse.json(
      { message: 'Roles saved successfully', roles: body.roles },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving council roles:', error)
    return NextResponse.json({ error: 'Failed to save roles' }, { status: 500 })
  }
}
