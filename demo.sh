#!/bin/bash

# CogniTwin Demo Script
# Shows all the new AI features in action

echo "🚀 CogniTwin AI Demo"
echo "===================="
echo ""

# Check if services are running
echo "📡 Checking services..."
if ! curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo "❌ Forecasting service not running on port 8001"
    echo "   Start it with: cd backend/services/forecasting && python main.py"
    exit 1
fi

if ! curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "❌ LLM Council not running on port 4000"
    echo "   Start it with: cd backend/llm-council/orchestrator && npm run dev"
    exit 1
fi

echo "✅ All services running!"
echo ""

# Demo 1: ML Forecasting
echo "📊 Demo 1: ML Forecasting (Prophet + LSTM)"
echo "==========================================="
echo "Calling: GET /forecasts/revenue?days=30"
echo ""

FORECAST=$(curl -s http://localhost:8001/forecasts/revenue?days=30 \
  -H "X-Tenant-ID: tenant_123")

MODEL=$(echo $FORECAST | jq -r '.model_type')
ACCURACY=$(echo $FORECAST | jq -r '.accuracy * 100')
FIRST=$(echo $FORECAST | jq -r '.data[0].forecast')
LAST=$(echo $FORECAST | jq -r '.data[-1].forecast')

echo "Model Type: $MODEL"
echo "Accuracy: ${ACCURACY}%"
echo "First Day Prediction: \$$FIRST"
echo "Last Day Prediction: \$$LAST"
echo ""
read -p "Press Enter to continue..."
echo ""

# Demo 2: Council Analysis
echo "🧠 Demo 2: LLM Council Analysis"
echo "================================"
echo "Calling: POST /council/forecast/analyze"
echo ""

ANALYSIS=$(curl -s -X POST http://localhost:4000/council/forecast/analyze \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{
    "metric": "revenue",
    "horizonDays": 30,
    "useEnsemble": true
  }')

GROWTH=$(echo $ANALYSIS | jq -r '.forecast.growthRate')
INSIGHT=$(echo $ANALYSIS | jq -r '.actionableInsights[0].title')
IMPACT=$(echo $ANALYSIS | jq -r '.actionableInsights[0].expectedImpact')

echo "Forecasted Growth: ${GROWTH}%"
echo "Top Insight: $INSIGHT"
echo "Expected Impact: $IMPACT"
echo ""
read -p "Press Enter to continue..."
echo ""

# Demo 3: Compare Councils
echo "🎭 Demo 3: Compare Council Decisions"
echo "====================================="
echo "Testing same scenario with 3 different councils..."
echo ""

COMPARISON=$(curl -s -X POST http://localhost:4000/council/simulate/compare \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioBase": {
      "name": "Price Increase 25%",
      "metric": "revenue",
      "assumptions": { "price_increase": 0.25 }
    },
    "presetIds": ["startup_aggressive", "enterprise_conservative", "balanced_growth"]
  }')

echo "Scenario: Price Increase 25%"
echo ""

for preset in "startup_aggressive" "enterprise_conservative" "balanced_growth"; do
    OUTCOME=$(echo $COMPARISON | jq -r ".recommendations[] | select(.council | contains(\"$(echo $preset | sed 's/_/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')\")) | .outcome")
    COUNCIL=$(echo $COMPARISON | jq -r ".recommendations[] | select(.council | contains(\"$(echo $preset | sed 's/_/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')\")) | .council")

    if [ "$OUTCOME" = "approved" ]; then
        echo "✅ $COUNCIL: APPROVED"
    elif [ "$OUTCOME" = "rejected" ]; then
        echo "❌ $COUNCIL: REJECTED"
    else
        echo "⚠️  $COUNCIL: NEEDS MODIFICATION"
    fi
done

echo ""
echo "Same scenario, 3 different decisions based on council configuration!"
echo ""
read -p "Press Enter to continue..."
echo ""

# Demo 4: Agent Conversation
echo "💬 Demo 4: Agent Conversation & Thinking"
echo "========================================="
echo "Calling: POST /council/simulate/preset?debate=true"
echo ""

DEBATE=$(curl -s -X POST "http://localhost:4000/council/simulate/preset?debate=true" \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{
    "presetId": "balanced_growth",
    "scenarioName": "Price Increase 15%",
    "metric": "revenue",
    "assumptions": { "price_increase": 0.15 }
  }')

TOPIC=$(echo $DEBATE | jq -r '.debate.topic')
PARTICIPANTS=$(echo $DEBATE | jq -r '.debate.participants | join(", ")')

echo "Topic: $TOPIC"
echo "Participants: $PARTICIPANTS"
echo ""

echo "Analyst's Thought Process:"
echo "------------------------"
ANALYST_OBS=$(echo $DEBATE | jq -r '.debate.rounds[0].thoughts[0].thoughtProcess.observation')
echo "Observation: $ANALYST_OBS"
echo ""
echo "Reasoning:"
echo $DEBATE | jq -r '.debate.rounds[0].thoughts[0].thoughtProcess.reasoning[]' | nl
echo ""

ANALYST_CONCLUSION=$(echo $DEBATE | jq -r '.debate.rounds[0].thoughts[0].thoughtProcess.conclusion')
echo "Conclusion: $ANALYST_CONCLUSION"
echo ""

MESSAGES=$(echo $DEBATE | jq -r '[.debate.rounds[].messages[]] | length')
echo "Total messages exchanged: $MESSAGES"
echo ""

FINAL=$(echo $DEBATE | jq -r '.finalDecision.outcome')
REASONING=$(echo $DEBATE | jq -r '.finalDecision.reasoning')

echo "Final Decision: $FINAL"
echo "Reasoning: $REASONING"
echo ""

echo "🎉 Demo Complete!"
echo "================="
echo ""
echo "What you saw:"
echo "✅ Real ML models (Prophet + LSTM) generating forecasts"
echo "✅ 6 AI agents analyzing the forecast"
echo "✅ Different councils making different decisions"
echo "✅ Complete transparency into agent thinking"
echo ""
echo "📚 Check out the documentation:"
echo "   - TESTING_GUIDE.md for detailed testing"
echo "   - AGENT_CONVERSATION_GUIDE.md for conversation features"
echo "   - SIMULATION_ENGINE_GUIDE.md for council configurations"
echo ""
