# 🤖 LLM Integration Guide

## Overview

CogniTwin's AI Council supports **two modes**:

1. **Rule-Based Agents** (Default) - Fast, deterministic, free
2. **Real LLM Agents** (Optional) - GPT-4 powered, creative, costs API fees

## Quick Start

### Option 1: Keep Using Rule-Based (Current Setup)

**No action needed!** The system is already running with sophisticated rule-based agents that:
- Calculate real statistics (growth rates, volatility, trends)
- Make data-driven decisions
- Provide consistent, predictable outputs
- Cost $0 to run
- Response time: <100ms

### Option 2: Enable Real LLM (GPT-4)

**Step 1: Get OpenAI API Key**
```bash
# Visit https://platform.openai.com/api-keys
# Create a new API key
# Copy the key (starts with sk-...)
```

**Step 2: Configure Environment**
```bash
cd /Users/sidharrthnarasimhan/CogniTwin/backend/llm-council/orchestrator

# Copy the example env file
cp .env.example .env

# Edit .env file
nano .env
```

**Step 3: Set Your API Key**
```bash
# In .env file:
USE_REAL_LLM=true
OPENAI_API_KEY=sk-your-actual-key-here
LLM_MODEL=gpt-4-turbo-preview
```

**Step 4: Restart the LLM Council Service**
```bash
# Kill the current service (Ctrl+C in the terminal running it)
# Or use:
pkill -f "npm run dev"

# Restart
npm run dev
```

**Step 5: Test with LLM**
```bash
curl -X POST 'http://localhost:4000/council/simulate/preset?debate=true' \
  -H 'X-Tenant-ID: tenant_123' \
  -H 'Content-Type: application/json' \
  -d '{"presetId":"balanced_growth","scenarioName":"Test","metric":"revenue","assumptions":{"price_increase":0.15}}'
```

You should see in the logs:
```
✅ LLM Client initialized with model: gpt-4-turbo-preview
✅ Analyst (GPT-4): Generated analysis for revenue
```

## Architecture

### Hybrid Approach

The system uses **automatic fallback**:

```typescript
if (LLM_enabled && API_key_valid) {
  // Use GPT-4
  response = await callGPT4(systemPrompt, context)
} else {
  // Use rule-based
  response = calculateUsingRules(context)
}
```

**Benefits:**
- ✅ Works without API key (rule-based fallback)
- ✅ Graceful degradation if API fails
- ✅ Can toggle LLM on/off without code changes
- ✅ Development/testing uses rule-based (free)
- ✅ Production can use LLM (more sophisticated)

### LLM Models Supported

**Currently Integrated: OpenAI**
- GPT-4 Turbo (recommended)
- GPT-4
- GPT-3.5 Turbo

**Can Be Added:**
- Anthropic Claude (Sonnet, Opus)
- Local models (Ollama, LM Studio)
- Azure OpenAI
- Google Gemini

## Cost Analysis

### GPT-4 Turbo Pricing

**Per Agent Call:**
- Input: ~500 tokens = $0.005
- Output: ~500 tokens = $0.015
- **Total: ~$0.02 per agent**

**Per 5-Agent Simulation:**
- 5 agents × $0.02 = **~$0.10**

**Monthly Estimates:**
| Simulations/Day | Cost/Day | Cost/Month |
|----------------|----------|------------|
| 10 | $1 | $30 |
| 100 | $10 | $300 |
| 1000 | $100 | $3000 |

### GPT-3.5 Turbo Pricing (10x cheaper)

**Per 5-Agent Simulation:** ~$0.01

| Simulations/Day | Cost/Day | Cost/Month |
|----------------|----------|------------|
| 100 | $1 | $30 |
| 1000 | $10 | $300 |

### Rule-Based (Current)

**Cost:** $0 forever

## When to Use Each Mode

### Use Rule-Based When:
- ✅ Development and testing
- ✅ High-volume simulations (1000s per day)
- ✅ Predictable, consistent outputs needed
- ✅ Low latency required (<100ms)
- ✅ No budget for API costs
- ✅ Compliance requires deterministic decisions

### Use Real LLM When:
- ✅ Need creative strategic insights
- ✅ Complex, nuanced scenarios
- ✅ Natural language explanations matter
- ✅ Qualitative judgment needed
- ✅ Lower volume, higher value decisions
- ✅ Budget for $0.10-$0.50 per simulation

## Comparison Table

| Feature | Rule-Based | GPT-4 | GPT-3.5 |
|---------|-----------|-------|---------|
| **Speed** | <100ms | 2-5s | 1-2s |
| **Cost/Simulation** | $0 | $0.10 | $0.01 |
| **Consistency** | Perfect | Good | Fair |
| **Creativity** | Low | High | Medium |
| **Setup** | None | API Key | API Key |
| **Dependencies** | None | Internet | Internet |
| **Scalability** | Unlimited | Rate limited | Rate limited |

## Agent-Specific Settings

Each agent has optimized temperature settings for LLM calls:

```typescript
const temperatures = {
  analyst: 0.2,      // Very consistent, data-focused
  'risk-officer': 0.3, // Consistent risk assessment
  cfo: 0.3,          // Consistent financial analysis
  operator: 0.4,     // Practical but flexible
  strategist: 0.6,   // Creative strategic thinking
  ceo: 0.5          // Balanced decision-making
};
```

## Code Examples

### Check Which Mode is Active

```typescript
import { getLLMClient } from './lib/llm-client';

const client = getLLMClient();
console.log(`Using: ${client.getModelName()}`); // "gpt-4-turbo-preview" or "rule-based"
console.log(`LLM Enabled: ${client.isEnabled()}`); // true or false
```

### Call Agent with LLM

```typescript
import { callAnalystAgent } from './agents/analyst';

const result = await callAnalystAgent(
  "Analyze this forecast",
  {
    metric: 'revenue',
    currentValue: 50000,
    forecastData: [...],
    modelAccuracy: 0.89,
    trend: 'increasing'
  }
);

// Automatically uses LLM if enabled, otherwise rule-based
```

## Monitoring & Debugging

### Check Logs

```bash
# You'll see one of these:
ℹ️  Using rule-based agents (USE_REAL_LLM=false)
# OR
✅ LLM Client initialized with model: gpt-4-turbo-preview
```

### Per-Request Logs

```bash
✅ Analyst (GPT-4): Generated analysis for revenue
# OR
ℹ️  analyst: Using rule-based (LLM not enabled)
```

### Error Handling

```bash
⚠️  LLM call failed, falling back to rule-based: API rate limit exceeded
   Falling back to rule-based implementation
```

## Advanced: Adding Other LLM Providers

### Anthropic Claude

**Step 1: Install SDK**
```bash
npm install @anthropic-ai/sdk
```

**Step 2: Update llm-client.ts**
```typescript
import Anthropic from '@anthropic-ai/sdk';

// In LLMClient class:
private anthropic: Anthropic | null = null;

if (LLM_PROVIDER === 'anthropic') {
  this.anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}
```

### Local LLMs (Ollama)

**Step 1: Install Ollama**
```bash
curl https://ollama.ai/install.sh | sh
ollama pull llama3
```

**Step 2: Update client to call localhost:11434**

## Security Best Practices

1. **Never commit .env file**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment-specific keys**
   - Development: Lower-rate-limit key
   - Production: Higher-rate-limit key

3. **Set usage limits in OpenAI dashboard**
   - Monthly budget cap
   - Rate limits per minute

4. **Monitor costs**
   ```bash
   # Check OpenAI usage dashboard daily
   https://platform.openai.com/usage
   ```

## Troubleshooting

### "LLM not configured" error

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Check USE_REAL_LLM is set
cat .env | grep USE_REAL_LLM

# Should show:
USE_REAL_LLM=true
```

### "API rate limit exceeded"

**Solution 1: Wait**
- Free tier: 3 requests/min
- Tier 1: 60 requests/min

**Solution 2: Upgrade OpenAI tier**

**Solution 3: Fallback to rule-based temporarily**
```bash
USE_REAL_LLM=false
```

### High costs

**Solution:**
```bash
# Switch to GPT-3.5 (10x cheaper)
LLM_MODEL=gpt-3.5-turbo

# Or disable LLM
USE_REAL_LLM=false
```

## Next Steps

1. **Test both modes** to compare quality
2. **Monitor costs** for your usage patterns
3. **Consider hybrid approach:**
   - Rule-based for high-volume simulations
   - LLM for important strategic decisions
4. **Fine-tune system prompts** for your business context

## Files Created

- `/backend/llm-council/orchestrator/src/lib/llm-client.ts` - LLM integration
- `/backend/llm-council/orchestrator/src/lib/llm-agent-wrapper.ts` - Agent wrapper
- `/backend/llm-council/orchestrator/.env.example` - Configuration template
- `/backend/llm-council/orchestrator/src/agents/analyst.ts` - Updated with LLM support

## Summary

✅ **LLM integration is ready!**
✅ **No code changes needed to toggle**
✅ **Automatic fallback to rule-based**
✅ **Works with or without API key**
✅ **Production-ready architecture**

Just set `USE_REAL_LLM=true` and add your API key when you're ready!
