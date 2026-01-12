# 🎮 LLM Council Simulation Engine

## Overview

The **Simulation Engine** allows you to configure different "councils" of AI agents with varying perspectives, risk tolerances, and decision-making frameworks to simulate how different organizational structures would handle the same business scenario.

### Key Concept

**Different organizations make different decisions**:
- A **startup** with aggressive CEO might approve a risky 50% price increase
- An **enterprise** with conservative board might reject the same scenario
- A **balanced council** might approve with modifications

The Simulation Engine lets you **model these differences** and see how council composition affects decisions.

## Architecture

```
Business Scenario
    ↓
┌───────────────────────────────────────────────────┐
│         Simulation Engine                         │
│                                                   │
│  Apply assumptions to forecast                    │
│  (e.g., +10% price, +5% churn)                   │
└──────────────┬────────────────────────────────────┘
               │
               ▼
     [Forecasting Service]
     Get ML predictions with
     scenario assumptions applied
               │
               ▼
┌──────────────────────────────────────────────────┐
│         Configure Agent Council                   │
│                                                   │
│  Each agent has:                                  │
│  - Role (Analyst, Strategist, CFO, CEO, etc.)   │
│  - Weight (importance in final decision)          │
│  - Perspective (aggressive/conservative/balanced) │
│  - Risk Tolerance (low/medium/high)               │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│      Each Agent Evaluates Scenario               │
│                                                   │
│  Analyst: "Growth is 28%, confidence 89%"        │
│  → Decision: APPROVE ✓                           │
│                                                   │
│  Risk Officer (low tolerance): "Too risky"       │
│  → Decision: REJECT ✗                            │
│                                                   │
│  CFO (conservative): "ROI only 1.8x"             │
│  → Decision: CONDITIONAL ⚠                       │
│                                                   │
│  CEO (aggressive): "Strategic fit excellent"     │
│  → Decision: APPROVE ✓                           │
└──────────────┬───────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────┐
│      Apply Decision Framework                     │
│                                                   │
│  - Consensus: All must agree                      │
│  - Weighted Vote: Sum of weighted decisions       │
│  - CEO Final Say: CEO overrides all              │
│  - Risk-Adjusted: Risk officer has veto           │
└──────────────┬───────────────────────────────────┘
               │
               ▼
        Final Decision:
        ✓ Approved
        ✗ Rejected
        ⚠ Needs Modification
```

## Use Cases

### 1. Test Organizational Structures

**Question**: *"How would our decision change if we had a different leadership team?"*

```bash
# Compare startup vs enterprise decision-making
curl -X POST http://localhost:4000/council/simulate/compare \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioBase": {
      "name": "Increase prices by 25%",
      "metric": "revenue",
      "assumptions": {
        "price_increase": 0.25,
        "churn_impact": 0.08
      }
    },
    "presetIds": ["startup_aggressive", "enterprise_conservative", "balanced_growth"]
  }'
```

**Result**:
- **Startup (Aggressive)**: ✅ APPROVED - "Go for it, high risk high reward"
- **Enterprise (Conservative)**: ❌ REJECTED - "Risk exceeds tolerance"
- **Balanced Growth**: ⚠️ CONDITIONAL - "Approve with 15% price increase instead"

### 2. Risk Tolerance Simulation

**Question**: *"What if our risk tolerance was higher/lower?"*

```javascript
// Custom council with HIGH risk tolerance
{
  "agentConfigs": [
    {
      "agent": "analyst",
      "weight": 0.3,
      "perspective": "data-driven",
      "riskTolerance": "high",  // ← High tolerance
      "enabled": true
    },
    {
      "agent": "risk-officer",
      "weight": 0.4,
      "perspective": "balanced",
      "riskTolerance": "high",  // ← High tolerance
      "enabled": true
    }
  ],
  "decisionFramework": "weighted-vote"
}
```

### 3. Decision Framework Comparison

**Question**: *"Does the decision change with different voting rules?"*

Test same agents with different frameworks:
- **Consensus** (all must agree) → More rejections
- **CEO Final Say** → CEO opinion dominates
- **Weighted Vote** → Balanced based on agent importance
- **Risk-Adjusted** → Risk officer veto power

### 4. "What-If" Scenario Planning

**Question**: *"What if we increase price by 30% AND improve retention by 10%?"*

```json
{
  "name": "Aggressive Price + Retention Play",
  "metric": "revenue",
  "assumptions": {
    "price_increase": 0.30,
    "churn_decrease": 0.10,
    "expansion_revenue": 0.15
  }
}
```

Agents evaluate compound effects and provide decision.

## Preset Council Configurations

### 1. Startup - Aggressive Growth

**Profile**: Fast-moving startup with growth-at-all-costs mentality

**Agents**:
- Analyst (20%) - Data-driven, high risk tolerance
- Strategist (30%) - Aggressive perspective
- CEO (50%) - Final say, aggressive

**Framework**: CEO Final Say

**Typical Behavior**:
- ✅ Approves high-growth scenarios even with moderate risk
- ✅ Prioritizes speed over safety
- ❌ May reject if data clearly shows failure

**Example**:
```bash
curl -X POST http://localhost:4000/council/simulate/preset \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{
    "presetId": "startup_aggressive",
    "scenarioName": "Launch enterprise tier immediately",
    "metric": "revenue",
    "assumptions": { "price_increase": 0.50 }
  }'
```

### 2. Enterprise - Risk-Averse

**Profile**: Large enterprise with compliance and risk management focus

**Agents**:
- Analyst (25%) - Data-driven, low risk tolerance
- Risk Officer (30%) - Conservative, low risk tolerance
- CFO (25%) - Conservative, low risk tolerance
- Operator (20%) - Balanced, medium risk tolerance

**Framework**: Consensus (all must agree)

**Typical Behavior**:
- ❌ Rejects high-risk scenarios
- ⚠️ Adds many requirements/conditions
- ✅ Only approves with strong data and low risk

**Example**:
```bash
curl -X POST http://localhost:4000/council/simulate/preset \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{
    "presetId": "enterprise_conservative",
    "scenarioName": "Modest 5% price increase",
    "metric": "revenue",
    "assumptions": { "price_increase": 0.05 }
  }'
```

### 3. Balanced Growth

**Profile**: Mature company balancing growth and stability

**Agents**:
- Analyst (20%) - Data-driven, medium risk
- Strategist (25%) - Balanced perspective
- Risk Officer (20%) - Balanced, medium risk
- CFO (20%) - Balanced, medium risk
- Operator (15%) - Balanced, medium risk

**Framework**: Weighted Vote (needs 70% approval)

**Typical Behavior**:
- ✅ Approves well-supported growth initiatives
- ⚠️ Requires modifications for aggressive plans
- ❌ Rejects poorly supported or very risky scenarios

## API Endpoints

### 1. POST /council/simulate

Run a custom simulation with full control over agents and framework.

**Request**:
```json
{
  "name": "Price Increase Simulation",
  "description": "Test 15% price increase impact",
  "metric": "revenue",
  "assumptions": {
    "price_increase": 0.15,
    "churn_impact": 0.03
  },
  "agentConfigs": [
    {
      "agent": "analyst",
      "weight": 0.25,
      "perspective": "data-driven",
      "riskTolerance": "medium",
      "enabled": true
    },
    {
      "agent": "strategist",
      "weight": 0.25,
      "perspective": "balanced",
      "riskTolerance": "medium",
      "enabled": true
    },
    {
      "agent": "cfo",
      "weight": 0.25,
      "perspective": "conservative",
      "riskTolerance": "low",
      "enabled": true
    },
    {
      "agent": "risk-officer",
      "weight": 0.25,
      "perspective": "conservative",
      "riskTolerance": "low",
      "enabled": true
    }
  ],
  "decisionFramework": "weighted-vote"
}
```

**Response**:
```json
{
  "scenario": { /* your input scenario */ },
  "forecastData": {
    "metric": "revenue",
    "data": [ /* forecast with assumptions applied */ ],
    "scenario": "Price Increase Simulation",
    "assumptions": { "price_increase": 0.15 }
  },
  "agentDecisions": [
    {
      "agent": "analyst",
      "decision": "approve",
      "reasoning": "Forecast shows 18.5% revenue growth with 87% confidence",
      "confidence": 0.87,
      "concerns": [],
      "requirements": [],
      "weight": 0.25
    },
    {
      "agent": "cfo",
      "decision": "conditional",
      "reasoning": "ROI of 2.1x meets threshold. Proceed with cost optimization.",
      "confidence": 0.82,
      "concerns": [],
      "requirements": ["Optimize costs to improve ROI"],
      "weight": 0.25
    },
    {
      "agent": "risk-officer",
      "decision": "conditional",
      "reasoning": "Acceptable with risk mitigation measures in place.",
      "confidence": 0.80,
      "concerns": ["Moderate to high risk identified"],
      "requirements": [
        "Implement risk mitigation strategies",
        "Set up monitoring and kill switches"
      ],
      "weight": 0.25
    }
  ],
  "finalDecision": {
    "outcome": "needs-modification",
    "reasoning": "Weighted score 75% requires modifications.",
    "votes": {
      "approve": 1,
      "reject": 0,
      "conditional": 2
    },
    "confidence": 0.83,
    "modifications": [
      "Optimize costs to improve ROI",
      "Implement risk mitigation strategies",
      "Set up monitoring and kill switches"
    ]
  },
  "alternativeScenarios": [
    {
      "suggestion": "Implement risk mitigation strategies",
      "expectedOutcome": "Reduced risk with validated assumptions",
      "proposedBy": "Risk Officer"
    }
  ],
  "generatedAt": "2026-01-12T16:00:00Z"
}
```

### 2. POST /council/simulate/preset

Quick simulation using a preset council configuration.

**Request**:
```bash
curl -X POST http://localhost:4000/council/simulate/preset \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{
    "presetId": "balanced_growth",
    "scenarioName": "Q2 Price Optimization",
    "metric": "revenue",
    "assumptions": {
      "price_increase": 0.12,
      "churn_impact": 0.02
    }
  }'
```

### 3. POST /council/simulate/compare

Compare how different council configurations decide on the same scenario.

**Request**:
```json
{
  "scenarioBase": {
    "name": "Aggressive Growth Play",
    "metric": "revenue",
    "assumptions": {
      "price_increase": 0.30,
      "marketing_spend_increase": 0.50
    }
  },
  "presetIds": [
    "startup_aggressive",
    "enterprise_conservative",
    "balanced_growth"
  ]
}
```

**Response**:
```json
{
  "scenarios": [
    {
      "presetId": "startup_aggressive",
      "presetName": "Startup - Aggressive Growth",
      "result": {
        "finalDecision": {
          "outcome": "approved",
          "reasoning": "CEO decision: Strategic fit excellent. Approve for immediate execution.",
          "confidence": 0.92
        }
      }
    },
    {
      "presetId": "enterprise_conservative",
      "presetName": "Enterprise - Risk-Averse",
      "result": {
        "finalDecision": {
          "outcome": "rejected",
          "reasoning": "Consensus not reached. Risk Officer rejected due to high risk.",
          "confidence": 0.85
        }
      }
    },
    {
      "presetId": "balanced_growth",
      "presetName": "Balanced Growth",
      "result": {
        "finalDecision": {
          "outcome": "needs-modification",
          "reasoning": "Weighted score 65% requires modifications.",
          "confidence": 0.80
        }
      }
    }
  ],
  "summary": {
    "approved": 1,
    "rejected": 1,
    "needsModification": 1
  },
  "recommendations": [
    {
      "council": "Startup - Aggressive Growth",
      "outcome": "approved",
      "reasoning": "CEO decision: Approve immediately",
      "confidence": 0.92
    },
    {
      "council": "Enterprise - Risk-Averse",
      "outcome": "rejected",
      "reasoning": "Risk exceeds tolerance",
      "confidence": 0.85
    },
    {
      "council": "Balanced Growth",
      "outcome": "needs-modification",
      "reasoning": "Approve with modifications",
      "confidence": 0.80
    }
  ]
}
```

### 4. GET /council/presets

List all available preset configurations.

**Response**:
```json
{
  "presets": [
    {
      "id": "startup_aggressive",
      "name": "Startup - Aggressive Growth",
      "agentConfigs": [...],
      "decisionFramework": "ceo-final-say"
    },
    {
      "id": "enterprise_conservative",
      "name": "Enterprise - Risk-Averse",
      "agentConfigs": [...],
      "decisionFramework": "consensus"
    },
    {
      "id": "balanced_growth",
      "name": "Balanced Growth",
      "agentConfigs": [...],
      "decisionFramework": "weighted-vote"
    }
  ]
}
```

## Agent Roles

### Available Agents

1. **analyst** - Data analysis, statistical evaluation
2. **strategist** - Business strategy, growth opportunities
3. **operator** - Operational feasibility, capacity
4. **risk-officer** - Risk assessment, compliance
5. **cfo** - Financial analysis, ROI
6. **ceo** - Strategic alignment, final decision
7. **industry-expert** - Benchmarks, best practices (future)

### Agent Perspectives

- **aggressive**: Growth-focused, high risk acceptance
- **conservative**: Safety-focused, low risk tolerance
- **balanced**: Middle ground approach
- **data-driven**: Focuses on metrics and evidence

### Risk Tolerance Levels

- **low**: Rejects scenarios with >30% risk score
- **medium**: Accepts moderate risk with mitigations
- **high**: Comfortable with high-risk, high-reward

### Agent Weight

**Weight determines influence** in final decision (0.0 - 1.0):
- CEO in startup: `weight: 0.5` (50% influence)
- Risk officer in enterprise: `weight: 0.3` (30% influence)
- Equal council: all agents `weight: 0.2` (20% each)

## Decision Frameworks

### 1. Consensus

**All agents must approve** for final approval.

**Use when**: Risk-averse, need full alignment

**Example**: Enterprise board decisions

**Behavior**:
- ✅ Approved: All agents vote "approve"
- ⚠️ Needs Modification: Any agent votes "conditional"
- ❌ Rejected: Any agent votes "reject"

### 2. Weighted Vote

**Sum weighted scores** to reach decision (needs 70%).

**Use when**: Democratic process with varying importance

**Example**: Balanced leadership team

**Calculation**:
```
score = Σ (agent_weight × vote_value)
where vote_value = { approve: 1.0, conditional: 0.5, reject: 0.0 }

if score ≥ 0.7: approved
if score ≥ 0.5: needs-modification
if score < 0.5: rejected
```

### 3. CEO Final Say

**CEO decision overrides** all others.

**Use when**: Single leader has authority

**Example**: Founder-led startup

**Behavior**: CEO vote becomes final decision, other agents advisory only

### 4. Risk-Adjusted

**Risk officer has veto power**, others vote normally.

**Use when**: Compliance/risk management critical

**Example**: Financial services, healthcare

**Behavior**:
- If risk officer votes "reject": REJECTED
- Otherwise: Majority vote determines outcome

## Real-World Examples

### Example 1: Pricing Strategy

**Scenario**: Increase SaaS pricing by 20%

**Startup Council** (aggressive):
```
Analyst: ✅ "Data supports, 22% revenue growth projected"
Strategist: ✅ "Aligns with premium positioning"
CEO: ✅ "Let's move fast"
→ APPROVED (CEO final say)
```

**Enterprise Council** (conservative):
```
Analyst: ✅ "Growth projected at 18%"
Risk Officer: ❌ "Churn risk 12%, exceeds 10% threshold"
CFO: ⚠️ "ROI acceptable with churn mitigation"
Operator: ⚠️ "Need customer success scaling"
→ REJECTED (Consensus failed, Risk Officer veto)
```

**Balanced Council**:
```
Analyst (20%): ✅ Approve → 0.20
Strategist (25%): ✅ Approve → 0.25
Risk Officer (20%): ⚠️ Conditional → 0.10
CFO (20%): ⚠️ Conditional → 0.10
Operator (15%): ✅ Approve → 0.15
Total weighted score: 0.80 (80%)
→ APPROVED (Exceeds 70% threshold)
```

### Example 2: New Market Expansion

**Scenario**: Enter European market (40% investment)

**Aggressive Startup**: ✅ "High growth potential, approve"
**Conservative Enterprise**: ❌ "ROI uncertain, too risky"
**Balanced Growth**: ⚠️ "Pilot in UK first, then expand"

## Benefits

### 1. Test Organizational Design

See how council composition affects decisions **before** making structural changes.

### 2. Risk Scenario Planning

Model best-case, worst-case, and likely-case with different risk profiles.

### 3. Alignment Building

Show stakeholders how different perspectives evaluate the same scenario.

### 4. Decision Documentation

Record *why* decision was made and which factors influenced it.

### 5. Learning & Improvement

Compare simulated decisions vs actual outcomes to improve agent logic.

## Summary

### What the Simulation Engine Does

✅ **Models organizational decision-making** with configurable AI agents
✅ **Simulates different perspectives** (aggressive, conservative, balanced)
✅ **Applies decision frameworks** (consensus, weighted vote, CEO final say)
✅ **Compares council configurations** side-by-side
✅ **Integrates with ML forecasts** to test real business scenarios
✅ **Generates actionable insights** with reasoning and confidence scores

### Key Innovation

Instead of **one AI making all decisions**, you get a **council of specialized agents** with different roles, perspectives, and voting power - just like a real leadership team.

This enables **"what-if" governance modeling**: *"How would our decision change if we had a different CEO? More risk-averse board? Different voting structure?"*

---

**Files**: 1 core simulation engine (600+ lines)
**API Endpoints**: 4 new endpoints
**Preset Councils**: 3 (startup, enterprise, balanced)
**Agent Roles**: 6+ specialized roles
**Status**: Production-ready simulation framework
