# 🚀 Quick Reference - See Your AI in Action

## Start Services (2 Terminals)

**Terminal 1: Forecasting (ML)**
```bash
cd /Users/sidharrthnarasimhan/CogniTwin/backend/services/forecasting
python main.py
```
✅ Should see: `Uvicorn running on http://0.0.0.0:8001`

**Terminal 2: LLM Council (AI Agents)**
```bash
cd /Users/sidharrthnarasimhan/CogniTwin/backend/llm-council/orchestrator
npm run dev
```
✅ Should see: `LLM Council Orchestrator running on port 4000`

---

## Quick Tests

### 1. ML Forecast
```bash
curl http://localhost:8001/forecasts/revenue?days=30 -H "X-Tenant-ID: tenant_123" | jq
```
**Shows**: Prophet + LSTM predictions for 30 days

### 2. AI Analysis
```bash
curl -X POST http://localhost:4000/council/forecast/analyze \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{"metric":"revenue","horizonDays":30}' | jq
```
**Shows**: 6 AI agents analyzing forecast + actionable insights

### 3. Agent Conversation (THE COOL ONE!)
```bash
curl -X POST "http://localhost:4000/council/simulate/preset?debate=true" \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{"presetId":"balanced_growth","scenarioName":"Test","metric":"revenue","assumptions":{"price_increase":0.15}}' | jq
```
**Shows**: How agents think, debate, and reach consensus!

---

## Run Demo Script

```bash
cd /Users/sidharrthnarasimhan/CogniTwin
./demo.sh
```

Shows all 4 features automatically!

---

## File Locations

**Code**:
- ML Models: `/backend/services/forecasting/models/`
- AI Agents: `/backend/llm-council/orchestrator/src/agents/`
- Simulation: `/backend/llm-council/orchestrator/src/simulation-engine.ts`
- Conversation: `/backend/llm-council/orchestrator/src/agent-conversation.ts`

**Docs**:
- `TESTING_GUIDE.md` ← Full testing guide
- `AGENT_CONVERSATION_GUIDE.md` ← How to see agent thinking
- `SIMULATION_ENGINE_GUIDE.md` ← Council configurations
- `ML_FORECASTING_COMPLETE.md` ← ML models guide

---

## What You Built

✅ Real ML models (Prophet + LSTM)
✅ 6 AI agents with specialized roles
✅ Multi-agent council simulations
✅ Complete conversation transparency
✅ Different organizational structures
✅ Actionable insights with $ impact

**This is production-ready AI decision-making!**
