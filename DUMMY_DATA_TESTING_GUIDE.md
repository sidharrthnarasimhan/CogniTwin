# 🎲 Dummy Data Testing Guide

## Overview

Test CogniTwin's ML forecasting and AI Council **without any real business data!** This guide shows you how to generate realistic dummy data for testing all features.

## Why Use Dummy Data?

✅ **No Real Data Needed** - Test immediately without connecting databases
✅ **Realistic Patterns** - Data includes growth, seasonality, and volatility
✅ **Multiple Business Types** - Pre-configured for SaaS, e-commerce, B2B, etc.
✅ **Reproducible Tests** - Consistent data for debugging
✅ **Safe Experimentation** - Try risky scenarios without real consequences

## Available Business Profiles

### 1. `startup_saas`
- **Description**: Early-stage SaaS startup
- **Base Revenue**: $10,000/month
- **Growth Rate**: 8% monthly
- **Metrics**: revenue, customers, churn_rate, mrr

### 2. `ecommerce`
- **Description**: Mid-market e-commerce store
- **Base Revenue**: $250,000/month
- **Growth Rate**: 4% monthly
- **Metrics**: revenue, customers, orders, avg_order_value

### 3. `enterprise_b2b`
- **Description**: Enterprise B2B software company
- **Base Revenue**: $500,000/month
- **Growth Rate**: 3% monthly
- **Metrics**: revenue, customers, pipeline_value, deal_size

### 4. `restaurant`
- **Description**: Restaurant or food service
- **Base Revenue**: $45,000/month
- **Growth Rate**: 2% monthly
- **Metrics**: revenue, customers, avg_check, table_turns

### 5. `agency`
- **Description**: Digital marketing/consulting agency
- **Base Revenue**: $120,000/month
- **Growth Rate**: 5% monthly
- **Metrics**: revenue, clients, project_value, utilization_rate

## Quick Start Examples

### 1. List Available Profiles

```bash
curl http://localhost:8001/dummy/profiles | jq
```

**Response:**
```json
{
  "profiles": ["startup_saas", "ecommerce", "enterprise_b2b", "restaurant", "agency"],
  "details": {
    "startup_saas": {
      "metrics": ["revenue", "customers", "churn_rate", "mrr"],
      "base_values": {
        "revenue": 10000,
        "customers": 150,
        "churn_rate": 5.5,
        "mrr": 8500
      }
    }
  }
}
```

### 2. Generate Dummy Historical Data

**SaaS Startup Revenue (90 days):**
```bash
curl 'http://localhost:8001/dummy/data/startup_saas/revenue?days=90' | jq
```

**E-commerce Orders (30 days with trend change):**
```bash
curl 'http://localhost:8001/dummy/data/ecommerce/orders?days=30&trend_change=true' | jq
```

**Restaurant Revenue (60 days, no seasonality):**
```bash
curl 'http://localhost:8001/dummy/data/restaurant/revenue?days=60&seasonality=false' | jq
```

### 3. Get Test Scenario Assumptions

```bash
curl http://localhost:8001/dummy/scenarios | jq
```

**Response:**
```json
{
  "scenarios": {
    "optimistic": {
      "price_increase": 0.20,
      "customer_acquisition_boost": 0.35,
      "churn_reduction": 0.25
    },
    "realistic": {
      "price_increase": 0.10,
      "customer_acquisition_boost": 0.15,
      "churn_reduction": 0.10
    },
    "pessimistic": {
      "price_increase": -0.10,
      "churn_increase": 0.30
    }
  }
}
```

### 4. Run Complete Forecast with Dummy Data

**One command to generate data + train model + forecast:**

```bash
curl -X POST 'http://localhost:8001/dummy/forecast/startup_saas/revenue?days_historical=90&days_forecast=30' | jq
```

**Response includes:**
- Test data details
- Training metrics
- Full 30-day forecast
- Model type and accuracy

## Complete Testing Workflows

### Test 1: SaaS Growth Scenario

**Step 1: Generate historical data**
```bash
curl 'http://localhost:8001/dummy/data/startup_saas/revenue?days=90' | jq '.summary'
```

**Step 2: Run forecast**
```bash
curl -X POST 'http://localhost:8001/dummy/forecast/startup_saas/revenue' | jq '.forecast.trend'
```

**Step 3: Test with AI Council**
```bash
curl -X POST 'http://localhost:4000/council/simulate/preset?debate=true' \
  -H 'X-Tenant-ID: test_saas' \
  -H 'Content-Type: application/json' \
  -d '{
    "presetId": "startup_aggressive",
    "scenarioName": "SaaS Price Increase",
    "metric": "revenue",
    "assumptions": {
      "price_increase": 0.20,
      "expected_churn": 0.10
    }
  }' | jq '.finalDecision'
```

### Test 2: E-commerce Peak Season

**Generate data with strong seasonality:**
```bash
curl -X POST 'http://localhost:8001/dummy/forecast/ecommerce/orders?days_historical=90&days_forecast=60' \
  | jq '.forecast.predictions | map(select(.date | contains("12-"))) | length'
```

Counts holiday season predictions!

### Test 3: B2B Enterprise Deal Pipeline

```bash
# Generate pipeline data
curl 'http://localhost:8001/dummy/data/enterprise_b2b/pipeline_value?days=90' \
  | jq '.data[-7:] | map(.value)'

# Forecast next quarter
curl -X POST 'http://localhost:8001/dummy/forecast/enterprise_b2b/pipeline_value?days_forecast=90' \
  | jq '.forecast.predictions | map(.forecast) | add / length'
```

### Test 4: Compare All Business Profiles

```bash
#!/bin/bash
for profile in startup_saas ecommerce enterprise_b2b restaurant agency; do
  echo "=== $profile ==="
  curl -s -X POST "http://localhost:8001/dummy/forecast/$profile/revenue?days_historical=60&days_forecast=30" \
    | jq -r '.training.metrics | "\(.model_type): \(.statistical_metrics.accuracy)% accuracy"'
done
```

### Test 5: Scenario Stress Testing

**Test each scenario type:**

```bash
for scenario in optimistic realistic pessimistic aggressive_growth cost_cutting; do
  echo "Testing: $scenario"

  # Get scenario assumptions
  assumptions=$(curl -s http://localhost:8001/dummy/scenarios | jq ".scenarios.$scenario")

  # Run simulation with these assumptions
  curl -s -X POST 'http://localhost:4000/council/simulate/preset' \
    -H 'X-Tenant-ID: test' \
    -H 'Content-Type: application/json' \
    -d "{
      \"presetId\": \"balanced_growth\",
      \"scenarioName\": \"$scenario test\",
      \"metric\": \"revenue\",
      \"assumptions\": $assumptions
    }" | jq -r '.finalDecision.outcome'

  echo "---"
done
```

## Python Testing (Direct)

If you want to test the generator directly:

```bash
cd /Users/sidharrthnarasimhan/CogniTwin/backend/services/forecasting
python -c "
from utils.dummy_data_generator import DummyDataGenerator

# Generate SaaS revenue data
gen = DummyDataGenerator('startup_saas')
data = gen.generate_metric_data('revenue', days_back=90)

print(f'Generated {len(data)} data points')
print(f'First: ${data[0][\"value\"]:,.2f} on {data[0][\"date\"]}')
print(f'Last: ${data[-1][\"value\"]:,.2f} on {data[-1][\"date\"]}')
print(f'Growth: {((data[-1][\"value\"] / data[0][\"value\"] - 1) * 100):.1f}%')
"
```

## Test Scenarios from JSON

We've pre-defined 10 common business scenarios in `/CogniTwin/test-scenarios.json`:

1. **price_increase_moderate** - 15% price increase
2. **price_increase_aggressive** - 30% price increase (risky)
3. **expansion_new_market** - Geographic expansion
4. **product_launch** - New premium tier
5. **cost_cutting_initiative** - 20% cost reduction
6. **marketing_blitz** - Aggressive marketing campaign
7. **defensive_strategy** - Competitor response
8. **saas_optimization** - Unit economics improvement
9. **crisis_response** - Economic downturn adaptation
10. **hyper_growth** - Post-fundraise growth push

**Test a scenario:**

```bash
# Read scenario from JSON
scenario=$(cat test-scenarios.json | jq '.scenarios.product_launch')

# Extract assumptions
assumptions=$(echo $scenario | jq '.assumptions')

# Run simulation
curl -X POST 'http://localhost:4000/council/simulate/preset?debate=true' \
  -H 'X-Tenant-ID: test' \
  -H 'Content-Type: application/json' \
  -d "{
    \"presetId\": \"balanced_growth\",
    \"scenarioName\": \"$(echo $scenario | jq -r '.name')\",
    \"metric\": \"revenue\",
    \"assumptions\": $assumptions
  }" | jq '.debate.finalConsensus'
```

## Advanced: Custom Data Generation

### Generate Data with Specific Patterns

**High Growth + High Volatility:**
```python
from utils.dummy_data_generator import DummyDataGenerator

gen = DummyDataGenerator('startup_saas')

# Modify growth and volatility
gen.config['revenue']['growth_rate'] = 0.15  # 15% daily growth!
gen.config['revenue']['volatility'] = 0.30   # 30% volatility

data = gen.generate_metric_data('revenue', days_back=60)
```

**Add Mid-Period Strategy Change:**
```bash
curl 'http://localhost:8001/dummy/data/startup_saas/revenue?days=90&trend_change=true' | jq '.data | .[44].value, .[45].value'
```

Notice the jump at day 45 (midpoint)!

## Testing Checklist

Use this checklist to thoroughly test the system:

- [ ] Test all 5 business profiles
- [ ] Generate data for each metric type
- [ ] Run forecasts with different horizons (7, 30, 90 days)
- [ ] Test with/without seasonality
- [ ] Test with/without trend changes
- [ ] Test all scenario types (optimistic, realistic, pessimistic)
- [ ] Test all council presets
- [ ] Test with debate mode enabled
- [ ] Compare council decisions on same scenario
- [ ] Verify forecast accuracy metrics

## Common Test Commands

**Quick health check:**
```bash
curl http://localhost:8001/health && echo " - Forecasting ✓"
curl http://localhost:4000/health && echo " - LLM Council ✓"
```

**Generate & forecast in one go:**
```bash
curl -X POST 'http://localhost:8001/dummy/forecast/startup_saas/mrr?days_forecast=30' | jq '{
  profile: .test_data.profile,
  metric: .test_data.metric,
  model: .training.model_type,
  accuracy: .training.metrics.statistical_metrics.accuracy,
  trend: .forecast.trend,
  first_forecast: .forecast.predictions[0].forecast,
  last_forecast: .forecast.predictions[-1].forecast
}'
```

**Compare models:**
```bash
# Statistical only
curl -X POST 'http://localhost:8001/dummy/forecast/startup_saas/revenue?use_ensemble=false' \
  | jq '.training.model_type'

# Ensemble (Statistical + LSTM)
curl -X POST 'http://localhost:8001/dummy/forecast/startup_saas/revenue?use_ensemble=true' \
  | jq '.training.model_type'
```

## Summary

**You can now test the entire CogniTwin platform without any real data!**

✅ Generate realistic business metrics
✅ Train ML models on dummy data
✅ Test AI Council decisions
✅ Compare different scenarios
✅ Verify system functionality

**Next Steps:**
1. Try the quick start examples above
2. Run the test workflows
3. Create your own custom scenarios
4. When ready, swap in real data!

The dummy data system uses the exact same code paths as real data, so anything that works with dummy data will work with real data.
