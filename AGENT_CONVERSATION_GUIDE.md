# 🗣️ Agent Conversation & Thinking Viewer

## Overview

See **exactly how LLM agents think and interact** with each other during decision-making. This feature provides complete transparency into:

1. **Agent Thought Processes** - Step-by-step reasoning
2. **Multi-Agent Debates** - How agents challenge each other
3. **Consensus Building** - Path from disagreement to decision
4. **Data References** - Which data influenced each agent

## Why This Matters

**Traditional AI**: Black box - you get a decision with minimal explanation

**CogniTwin Agent Conversations**: Complete transparency
- See each agent's 5-step reasoning process
- Watch agents ask questions and challenge assumptions
- Track how concerns are addressed
- Understand why the final decision was made

## Architecture

```
Simulation Request
    ↓
┌──────────────────────────────────────────────┐
│   Each Agent Generates Thought Process       │
│                                              │
│   Analyst:                                   │
│   ├─ Observation: "Model shows 89% accuracy"│
│   ├─ Reasoning:                              │
│   │   Step 1: Validate model confidence     │
│   │   Step 2: Analyze trend strength         │
│   │   Step 3: Calculate volatility           │
│   │   Step 4: Assess uncertainty             │
│   │   Step 5: Cross-reference history        │
│   ├─ Concerns: ["Accuracy below 90%"]       │
│   ├─ Questions: ["Risk Officer: Have you..."]│
│   └─ Conclusion: "Analysis supports approval"│
└──────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────┐
│        Multi-Round Debate                    │
│                                              │
│   Round 1: Questions & Objections            │
│   ├─ Analyst → Risk Officer: "Have you..."  │
│   ├─ Risk Officer → All: "I object because..│
│   └─ Strategist → CFO: "What about ROI?"    │
│                                              │
│   Round 2: Responses & Clarifications        │
│   ├─ Risk Officer → Analyst: "Re: your...  │
│   ├─ CFO → All: "I support this concern..." │
│   └─ Strategist → Risk Officer: "I agree..." │
│                                              │
│   Round 3: Consensus Building                │
│   └─ CEO → All: "Based on discussion..."    │
└──────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────┐
│        Final Consensus                       │
│                                              │
│   Decision: APPROVED (conditional)           │
│   Supporting: [Analyst, Strategist, CEO]     │
│   Dissenting: [Risk Officer]                 │
│   Reasoning: "After 8 exchanges, council..." │
└──────────────────────────────────────────────┘
```

## API Usage

### Enable Debate View

Add `?debate=true` to any simulation endpoint:

```bash
# With debate conversation
curl -X POST "http://localhost:4000/council/simulate/preset?debate=true" \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{
    "presetId": "balanced_growth",
    "scenarioName": "Price Increase 15%",
    "metric": "revenue",
    "assumptions": { "price_increase": 0.15 }
  }'
```

### Response Structure

```json
{
  "scenario": { /* scenario details */ },
  "forecastData": { /* ML predictions */ },
  "agentDecisions": [ /* each agent's vote */ ],
  "finalDecision": { /* outcome */ },

  "debate": {
    "topic": "Price Increase 15%",
    "participants": ["analyst", "strategist", "risk-officer", "cfo", "ceo"],

    "rounds": [
      {
        "roundNumber": 1,
        "thoughts": [
          {
            "agent": "analyst",
            "timestamp": "2026-01-12T16:00:00Z",
            "thoughtProcess": {
              "observation": "Examining forecast model output: Prophet + LSTM with 89% accuracy. Trend appears increasing.",
              "reasoning": [
                "Step 1: Validate model confidence - 89% accuracy is good",
                "Step 2: Analyze trend strength - increasing pattern detected",
                "Step 3: Calculate volatility - checking standard deviation",
                "Step 4: Assess forecast uncertainty - examining intervals",
                "Step 5: Cross-reference with historical patterns"
              ],
              "concerns": [],
              "questions": [
                "Risk Officer: Have you considered the uncertainty bands?",
                "Strategist: Does volatility align with growth timeline?"
              ],
              "conclusion": "Based on 89% model confidence and increasing trend, the quantitative analysis supports proceeding."
            },
            "confidence": 0.89,
            "dataReferences": [
              "Model: Prophet + LSTM Ensemble",
              "Accuracy: 89%",
              "Trend: increasing"
            ]
          },
          {
            "agent": "risk-officer",
            "thoughtProcess": {
              "observation": "Risk assessment shows 45% risk level. Organization tolerance is medium.",
              "reasoning": [
                "Step 1: Quantify forecast uncertainty - 11% uncertainty",
                "Step 2: Assess assumption risk - Each assumption compounds",
                "Step 3: Identify downside scenarios - What if assumptions fail?",
                "Step 4: Compare to risk appetite - 45% vs medium tolerance",
                "Step 5: Evaluate mitigation options"
              ],
              "concerns": [
                "Moderate risk present - monitoring required",
                "Key risk indicators should be defined"
              ],
              "questions": [
                "Strategist: Have you considered worst-case impact?",
                "CFO: What's the financial buffer if downside occurs?"
              ],
              "conclusion": "Risk can be managed with proper mitigation"
            }
          }
        ],
        "messages": [
          {
            "from": "analyst",
            "to": "risk-officer",
            "timestamp": "2026-01-12T16:00:01Z",
            "messageType": "question",
            "content": "Have you considered the uncertainty bands in your risk assessment?",
            "confidence": 0.89
          },
          {
            "from": "risk-officer",
            "to": "all",
            "timestamp": "2026-01-12T16:00:02Z",
            "messageType": "objection",
            "content": "I have concerns: Moderate risk present - monitoring required",
            "confidence": 0.84
          }
        ],
        "agreements": ["All agents agree: Forecast data quality is high"],
        "disagreements": []
      },
      {
        "roundNumber": 2,
        "thoughts": [],
        "messages": [
          {
            "from": "risk-officer",
            "to": "analyst",
            "timestamp": "2026-01-12T16:00:03Z",
            "messageType": "clarification",
            "content": "Re: Have you considered the uncertainty bands... - Yes, uncertainty is 11% which is acceptable",
            "referencesMessage": "2026-01-12T16:00:01Z",
            "confidence": 0.84
          },
          {
            "from": "cfo",
            "to": "risk-officer",
            "timestamp": "2026-01-12T16:00:04Z",
            "messageType": "support",
            "content": "I agree with your concerns. ROI is borderline at 1.8x",
            "confidence": 0.82
          }
        ]
      },
      {
        "roundNumber": 3,
        "messages": [
          {
            "from": "ceo",
            "to": "all",
            "timestamp": "2026-01-12T16:00:05Z",
            "messageType": "proposal",
            "content": "Based on our discussion, I propose we approve with conditions: standard monitoring, implement risk mitigation",
            "confidence": 0.92
          }
        ]
      }
    ],

    "finalConsensus": {
      "decision": "approve",
      "supportingAgents": ["analyst", "strategist", "ceo"],
      "dissenting": [],
      "reasoning": "After 6 exchanges, council approves with 3 in favor.",
      "confidence": 0.87
    }
  }
}
```

## Agent Thought Processes

### Analyst Thinking

**Focuses on**: Data quality, statistical validity, trend analysis

**5-Step Process**:
1. Validate model confidence level
2. Analyze trend strength and direction
3. Calculate forecast volatility
4. Assess prediction uncertainty
5. Cross-reference with historical data

**Example Output**:
```
Observation: "Model shows 89% accuracy with increasing trend"

Reasoning:
  Step 1: Validate model confidence - 89% is good ✓
  Step 2: Analyze trend - Strong increasing pattern
  Step 3: Calculate volatility - 4.2% (low risk)
  Step 4: Assess uncertainty - ±5.1% confidence band
  Step 5: Cross-reference - Aligns with Q4 2025 growth

Concerns: None (accuracy above 85% threshold)

Questions:
  → Risk Officer: "Have you factored uncertainty bands into risk score?"
  → Strategist: "Does 4.2% volatility align with timeline?"

Conclusion: "Quantitative analysis supports proceeding"
```

### Strategist Thinking

**Focuses on**: Growth opportunities, market positioning, strategic fit

**5-Step Process**:
1. Strategic alignment check
2. Market positioning analysis
3. Resource requirement assessment
4. Timing evaluation
5. Risk-reward balance

**Example Output**:
```
Observation: "Growth trajectory shows 18% change - moderate opportunity"

Reasoning:
  Step 1: Strategic alignment - Fits aggressive growth strategy ✓
  Step 2: Market positioning - Strengthens competitive position
  Step 3: Resource requirements - Need $500k investment
  Step 4: Timing analysis - Market timing favorable
  Step 5: Risk-reward - 2.1x ROI justifies strategic risk

Concerns:
  - "Competitor response could erode 30% of gains"
  - "Requires significant operational changes"

Questions:
  → Operator: "Can operations scale to support 18% growth?"
  → CFO: "What's ROI timeline - 6 months or 12 months?"

Conclusion: "Strategic opportunity warrants execution"
```

### Risk Officer Thinking

**Focuses on**: Risk quantification, downside scenarios, mitigation

**5-Step Process**:
1. Quantify forecast uncertainty
2. Assess assumption risk
3. Identify downside scenarios
4. Compare to risk appetite
5. Evaluate mitigation options

**Example Output**:
```
Observation: "Risk score 45% with medium tolerance threshold"

Reasoning:
  Step 1: Forecast uncertainty - 11% model uncertainty
  Step 2: Assumption risk - 3 assumptions compound to 18% risk
  Step 3: Downside scenarios - Worst case: -$200k revenue
  Step 4: Risk appetite - 45% within medium tolerance (50%)
  Step 5: Mitigation - Phased rollout reduces risk to 32%

Concerns:
  - "Moderate risk - monitoring required"
  - "Limited visibility into tail risks"

Questions:
  → Strategist: "Have you modeled worst-case strategic impact?"
  → CFO: "What's financial buffer for downside?"

Conclusion: "Risk manageable with mitigation: monitoring + kill switches"
```

### CFO Thinking

**Focuses on**: ROI, NPV, financial returns, payback period

**5-Step Process**:
1. Calculate revenue impact
2. Estimate investment required
3. Compute ROI and payback
4. Compare to hurdle rate
5. Assess financial risk

**Example Output**:
```
Observation: "Financial analysis shows 2.1x ROI and $150k NPV"

Reasoning:
  Step 1: Revenue impact - Projected $315k over 12 months
  Step 2: Investment required - $150k (marketing + ops)
  Step 3: ROI and payback - 2.1x return, 7-month payback
  Step 4: Hurdle rate - Target 2.0x, achieved 2.1x ✓
  Step 5: Financial risk - Downside still positive at 1.3x

Concerns:
  - "ROI barely exceeds 2.0x threshold"
  - "Sensitivity to churn assumption is high"

Questions:
  → Strategist: "Long-term strategic value beyond direct ROI?"
  → Operator: "Are cost estimates realistic?"

Conclusion: "Financial returns meet criteria - proceed"
```

### CEO Thinking

**Focuses on**: Holistic assessment, team consensus, leadership conviction

**5-Step Process**:
1. Strategic priority alignment
2. Team consensus evaluation
3. Competitive dynamics
4. Organizational readiness
5. Leadership conviction

**Example Output**:
```
Observation: "Strategic alignment 80%, team raised 3 concerns, 4 questions"

Reasoning:
  Step 1: Strategic priority - Advances core mission ✓
  Step 2: Team consensus - 3/5 support, 0 strong objections
  Step 3: Competitive dynamics - Strengthens market position
  Step 4: Organizational readiness - Team can execute
  Step 5: Leadership conviction - Right move despite risks

Concerns: None (team concerns addressed)

Questions:
  → All: "What are key success metrics to monitor?"
  → Risk Officer: "What would make you comfortable?"

Conclusion: "Strong strategic fit - leadership approves execution"
```

## Message Types

### 1. Question
**Purpose**: Seek clarification or additional information

**Example**:
```json
{
  "from": "analyst",
  "to": "risk-officer",
  "messageType": "question",
  "content": "Have you considered the uncertainty bands in your risk assessment?"
}
```

### 2. Objection
**Purpose**: Raise concerns or disagree

**Example**:
```json
{
  "from": "risk-officer",
  "to": "all",
  "messageType": "objection",
  "content": "I object: Risk level 72% exceeds our 50% threshold"
}
```

### 3. Support
**Purpose**: Agree with another agent's point

**Example**:
```json
{
  "from": "cfo",
  "to": "risk-officer",
  "messageType": "support",
  "content": "I agree with your risk concerns. ROI is also borderline."
}
```

### 4. Clarification
**Purpose**: Respond to questions or explain reasoning

**Example**:
```json
{
  "from": "risk-officer",
  "to": "analyst",
  "messageType": "clarification",
  "content": "Re: uncertainty bands - Yes, I've factored in ±5.1% margin",
  "referencesMessage": "previous-message-id"
}
```

### 5. Proposal
**Purpose**: Suggest final decision or compromise

**Example**:
```json
{
  "from": "ceo",
  "to": "all",
  "messageType": "proposal",
  "content": "Propose: Approve with phased rollout to address risk concerns"
}
```

## Debate Rounds

### Round 1: Initial Analysis
- Each agent shares thought process
- Agents ask questions to others
- Concerns are raised
- **Output**: Questions, objections

### Round 2: Discussion
- Agents respond to questions
- Supporting/challenging positions
- Clarifying reasoning
- **Output**: Clarifications, support/challenge messages

### Round 3: Consensus
- Senior agent (CEO/lead) proposes decision
- Final modifications suggested
- Agreement reached
- **Output**: Final proposal

## Real Example

### Scenario: "Increase price by 20%"

**Round 1: Thoughts**

**Analyst**:
```
✓ Observation: "89% model confidence, 22% revenue growth projected"
✓ Reasoning: [5 steps of data validation]
✓ Conclusion: "Data supports approval"
→ Questions Risk Officer about uncertainty
```

**Risk Officer**:
```
⚠ Observation: "65% risk score with medium tolerance"
⚠ Concerns: "Risk exceeds comfortable threshold"
✗ Conclusion: "Cannot approve without mitigation"
→ Questions CFO about downside scenario
```

**CFO**:
```
⚠ Observation: "1.9x ROI, below 2.0x target"
⚠ Concerns: "Returns marginal"
~ Conclusion: "Conditional - optimize costs first"
→ Questions Strategist about strategic value
```

**CEO**:
```
✓ Observation: "Strong strategic fit despite concerns"
✓ Reasoning: Team input valuable, leadership decides
✓ Conclusion: "Approve with risk mitigation"
```

**Round 1: Messages**

```
Analyst → Risk Officer: "Have you considered ±5% uncertainty?"
Risk Officer → All: "I object - 65% risk too high"
CFO → Strategist: "What's strategic value beyond ROI?"
```

**Round 2: Messages**

```
Risk Officer → Analyst: "Yes, factored in. Still concerning."
CFO → Risk Officer: "I support your concern - ROI is tight"
Strategist → CFO: "Strategic value: market leadership worth premium"
```

**Round 3: Proposal**

```
CEO → All: "Proposal: Approve at 15% price increase (not 20%)
              with phased rollout and weekly monitoring"
```

**Final Consensus**:
- **Decision**: Approved (conditional)
- **Supporting**: Analyst, Strategist, CEO (3/4)
- **Modifications**: Reduce to 15%, add monitoring
- **Confidence**: 84%

## Benefits

### 1. Complete Transparency
See exactly why each agent voted how they did

### 2. Explainable AI
Understand the reasoning behind AI decisions

### 3. Identify Blind Spots
See which concerns agents raise that you might have missed

### 4. Learning Tool
Study how expert agents analyze business scenarios

### 5. Trust Building
Transparency builds confidence in AI recommendations

## Use Cases

### 1. Audit Decisions
Review conversation to understand past decisions

### 2. Training
Show teams how to think through complex decisions

### 3. Documentation
Permanent record of decision-making process

### 4. Improvement
Identify where agent logic could be enhanced

## Summary

### What the Conversation Viewer Provides

✅ **Step-by-step agent reasoning** (5 steps per agent)
✅ **Inter-agent questions and debates** (multi-round dialogue)
✅ **Concerns and objections** (full transparency)
✅ **Data references** (which data influenced decisions)
✅ **Consensus building** (path to final decision)
✅ **Message threading** (track conversation flow)

### Key Innovation

Instead of a **black box AI decision**, you get a **full transcript** of how specialized agents:
- Analyzed the data
- Questioned each other
- Addressed concerns
- Built consensus
- Reached a decision

This is **AI governance transparency** - you can literally see the agents thinking and debating!

---

**File**: agent-conversation.ts (650+ lines)
**Integration**: Seamless with simulation engine
**API Parameter**: `?debate=true`
**Status**: Production-ready conversation system
