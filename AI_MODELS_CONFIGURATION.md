# AI Models Dynamic Configuration System

## Overview

CogniTwin now supports dynamic AI model configuration, allowing users to add and manage AI models (GPT-4, Claude, Gemini, etc.) through the UI. When users add models, the configuration automatically updates and the LLM Council starts using the new models without requiring code changes or restarts.

## Features

✅ **UI-Based Configuration**: Add AI models through the settings page
✅ **Multiple Providers**: OpenAI, Anthropic, Google AI supported
✅ **Secure API Key Storage**: Keys are encrypted at rest
✅ **Hot Reloading**: Changes take effect automatically
✅ **Connection Testing**: Test API connections before activation
✅ **Status Management**: Activate/deactivate models as needed

---

## User Guide

### Accessing the Settings Page

1. Navigate to the dashboard at `http://localhost:3002`
2. Click the **Settings** icon (gear icon) in the top right navigation bar
3. You'll be redirected to `/dashboard/settings/models`

### Adding a New AI Model

1. Click the **"Add Model"** button
2. Fill in the form:
   - **Model Name**: Friendly name (e.g., "GPT-4 for Analysis")
   - **Provider**: Select OpenAI, Anthropic, or Google
   - **Model ID**: Select from dropdown or enter custom ID
   - **API Key**: Your API key from the provider
   - **Description** (optional): Purpose or notes

3. Click **"Save Model"**
4. The model will be added with "inactive" status

### Testing a Model Connection

1. Find your model in the list
2. Click the **"Test"** button
3. The system will verify the API key and model accessibility
4. If successful, the model status will update to "active"

### Activating/Deactivating Models

- **Activate**: Click "Activate" to make the model available to the LLM Council
- **Deactivate**: Click "Deactivate" to disable the model without deleting it

### Deleting a Model

1. Click the **"Delete"** button on any model
2. Confirm the deletion
3. The model will be removed from the configuration

---

## Supported Providers

### OpenAI
- **Models**: gpt-4-turbo-preview, gpt-4, gpt-3.5-turbo
- **API Key Format**: `sk-...`
- **Get API Key**: https://platform.openai.com/api-keys

### Anthropic (Claude)
- **Models**:
  - claude-3-opus-20240229
  - claude-3-sonnet-20240229
  - claude-3-haiku-20240307
- **API Key Format**: `sk-ant-...`
- **Get API Key**: https://console.anthropic.com/

### Google AI (Gemini)
- **Models**: gemini-pro, gemini-pro-vision
- **API Key Format**: Various
- **Get API Key**: https://makersuite.google.com/app/apikey

---

## Technical Architecture

### Frontend Components

#### Settings Page
**File**: `/frontend/web/src/app/dashboard/settings/models/page.tsx`

Features:
- Model CRUD interface
- API key visibility toggle
- Connection testing UI
- Status management

#### Navigation
**File**: `/frontend/web/src/components/dashboard-nav.tsx`

The settings icon in the navigation bar links to the models configuration page.

### Backend APIs

#### Model Management APIs

**Base Path**: `/api/models`

##### GET /api/models
List all configured models (with masked API keys)

**Response**:
```json
{
  "models": [
    {
      "id": "1",
      "name": "GPT-4 Turbo",
      "provider": "openai",
      "modelId": "gpt-4-turbo-preview",
      "apiKey": "sk-••••••••••••••••demo",
      "status": "active",
      "createdAt": "2024-01-15"
    }
  ]
}
```

##### POST /api/models
Create a new model configuration

**Request**:
```json
{
  "name": "Claude 3 Opus",
  "provider": "anthropic",
  "modelId": "claude-3-opus-20240229",
  "apiKey": "sk-ant-...",
  "description": "For strategic analysis"
}
```

##### PATCH /api/models/[id]
Update model status or configuration

##### DELETE /api/models/[id]
Remove a model configuration

##### POST /api/models/[id]/test
Test model API connection

**Response**:
```json
{
  "success": true,
  "message": "OpenAI connection successful",
  "testedAt": "2024-01-23T10:30:00Z"
}
```

### Security

#### API Key Encryption

**Algorithm**: AES-256-CBC
**Key Source**: Environment variable `MODEL_ENCRYPTION_KEY`

**Encryption Process**:
```typescript
1. Generate random IV (16 bytes)
2. Encrypt API key with AES-256-CBC
3. Store as: iv:encryptedData (hex format)
```

**Files**:
- `/frontend/web/src/app/api/models/route.ts`
- `/frontend/web/src/app/api/models/[id]/route.ts`

### Model Loading System

#### TypeScript Model Loader
**File**: `/backend/llm-council/orchestrator/src/model-loader.ts`

**ModelRegistry Class**:
- Loads configurations from `config/ai-models.json`
- Decrypts API keys
- Instantiates provider clients (OpenAI, Anthropic, etc.)
- Auto-reloads every 1 minute
- Provides unified interface for all providers

**Usage**:
```typescript
import { getModelRegistry } from './model-loader'

const registry = getModelRegistry()
const model = await registry.getModel() // Gets first active model
const response = await model.generate(messages, { temperature: 0.7 })
```

#### Python Model Loader (Optional)
**File**: `/backend/llm_council/model_providers.py`

Similar functionality for Python-based services.

### LLM Council Integration

**File**: `/backend/llm-council/orchestrator/src/council.ts`

The LLM Council now supports dynamic models:

```typescript
// Enable dynamic models via environment variable
USE_DYNAMIC_MODELS=true

// Council will use configured models
const registry = getModelRegistry()
const model = await registry.getModel()
const response = await model.generate(messages)
```

**Fallback Behavior**:
- If `USE_DYNAMIC_MODELS=false`, uses hardcoded OpenAI client
- If no models configured, falls back to mock responses
- Graceful degradation ensures system always works

---

## Configuration Storage

### File Location
`/frontend/web/config/ai-models.json`

**Format**:
```json
[
  {
    "id": "1",
    "name": "GPT-4 Turbo",
    "provider": "openai",
    "modelId": "gpt-4-turbo-preview",
    "apiKey": "iv:encrypted_key",
    "description": "Default model for AI Council",
    "status": "active",
    "createdAt": "2024-01-15",
    "lastTested": "2024-01-23"
  }
]
```

### Future Migration to Database

The current file-based storage will be replaced with database storage:

**Planned Schema** (PostgreSQL):
```sql
CREATE TABLE ai_models (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  model_id VARCHAR(255) NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  last_tested TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

---

## Environment Variables

### Required Variables

```bash
# Model encryption key (32 characters recommended)
MODEL_ENCRYPTION_KEY=your-32-character-encryption-key

# Enable dynamic model loading in LLM Council
USE_DYNAMIC_MODELS=true

# Fallback OpenAI key (optional, for compatibility)
OPENAI_API_KEY=sk-...
```

### Production Setup

1. Generate a secure encryption key:
```bash
openssl rand -hex 32
```

2. Set in `.env`:
```bash
MODEL_ENCRYPTION_KEY=abc123...
USE_DYNAMIC_MODELS=true
```

3. Restart the application:
```bash
cd frontend/web && npm run dev
cd backend/llm-council/orchestrator && npm run dev
```

---

## How It Works: End-to-End Flow

### Adding a Model

1. **User Action**: User fills out form and clicks "Save Model"

2. **Frontend**:
   - Calls `POST /api/models` with API key
   - API encrypts the key
   - Saves to `config/ai-models.json`

3. **Backend**:
   - File watcher or auto-reload detects change
   - ModelRegistry reloads configurations
   - New provider client is instantiated

4. **Usage**:
   - LLM Council requests model from registry
   - Registry returns active provider
   - Council uses provider to generate responses

### Auto-Reload Mechanism

```typescript
// ModelRegistry checks every 1 minute
private readonly RELOAD_INTERVAL = 60000

async getModel(modelId?: string) {
  await this.loadModels() // Reloads if 1 min passed
  // ... return model
}
```

**Benefits**:
- No server restart needed
- Changes apply within 60 seconds
- Minimal performance overhead

---

## Testing the System

### Manual Test

1. Add a model through UI with your API key
2. Test the connection (should succeed)
3. Activate the model
4. Go to "AI Council" page (`/dashboard/insights`)
5. Models should now use your configured provider

### API Testing

```bash
# List models
curl http://localhost:3002/api/models

# Add model
curl -X POST http://localhost:3002/api/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GPT-4",
    "provider": "openai",
    "modelId": "gpt-4",
    "apiKey": "sk-..."
  }'

# Test connection
curl -X POST http://localhost:3002/api/models/1/test

# Delete model
curl -X DELETE http://localhost:3002/api/models/1
```

---

## Troubleshooting

### Models Not Loading

**Check**:
1. Is `config/ai-models.json` present?
2. Are API keys correctly encrypted?
3. Is `USE_DYNAMIC_MODELS=true` set?

**Debug**:
```bash
# Check model registry logs
cd backend/llm-council/orchestrator
npm run dev
# Watch for "Loaded model: ..." messages
```

### API Connection Failures

**Check**:
1. Is API key valid?
2. Is model ID correct for the provider?
3. Is internet connection working?

**Test manually**:
```bash
# OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-..."

# Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-..." \
  -H "anthropic-version: 2023-06-01"
```

### Encryption/Decryption Errors

**Check**:
1. Is `MODEL_ENCRYPTION_KEY` the same in all services?
2. Is the key exactly 32 characters (padded/truncated automatically)?

**Fix**:
```bash
# Set consistent key in all .env files
echo "MODEL_ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env
```

---

## Future Enhancements

### Planned Features

- [ ] Per-agent model assignment (different models for different agents)
- [ ] Usage tracking and cost monitoring
- [ ] Rate limiting and quota management
- [ ] Model performance analytics
- [ ] A/B testing between models
- [ ] Automatic model fallback on failure
- [ ] Support for local models (Ollama, etc.)
- [ ] Multi-tenant model isolation
- [ ] Audit logging for model changes

### Migration to Database

Currently uses file-based storage. Next version will:
- Store models in PostgreSQL
- Add tenant_id for multi-tenancy
- Include usage metrics
- Support model versioning

---

## API Reference

See **Backend APIs** section above for complete API documentation.

---

## Support

For issues or questions:
- Check the troubleshooting section
- Review logs in browser console and server logs
- Ensure all environment variables are set correctly

---

**Last Updated**: 2024-01-23
**Version**: 1.0.0
