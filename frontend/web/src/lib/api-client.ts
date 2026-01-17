/**
 * API Client for CogniTwin Backend Services
 *
 * Forecasting Service: http://localhost:8001
 * LLM Council Service: http://localhost:4000
 */

const FORECASTING_URL = process.env.NEXT_PUBLIC_FORECASTING_URL || 'http://localhost:8001'
const COUNCIL_URL = process.env.NEXT_PUBLIC_COUNCIL_URL || 'http://localhost:4000'

// ========================================
// FORECASTING SERVICE API
// ========================================

export const forecastingAPI = {
  /**
   * Get list of available business profiles for dummy data generation
   */
  getDummyProfiles: async () => {
    const res = await fetch(`${FORECASTING_URL}/dummy/profiles`)
    if (!res.ok) throw new Error('Failed to fetch dummy profiles')
    return res.json()
  },

  /**
   * Generate dummy historical data for a specific profile and metric
   */
  generateDummyData: async (params: {
    profile: string
    metric: string
    days?: number
    seasonality?: boolean
    trend_change?: boolean
  }) => {
    const { profile, metric, days = 90, seasonality = true, trend_change = false } = params
    const queryParams = new URLSearchParams({
      days: days.toString(),
      seasonality: seasonality.toString(),
      trend_change: trend_change.toString()
    })

    const res = await fetch(`${FORECASTING_URL}/dummy/data/${profile}/${metric}?${queryParams}`)
    if (!res.ok) throw new Error('Failed to generate dummy data')
    return res.json()
  },

  /**
   * Get predefined test scenarios
   */
  getTestScenarios: async () => {
    const res = await fetch(`${FORECASTING_URL}/dummy/scenarios`)
    if (!res.ok) throw new Error('Failed to fetch test scenarios')
    return res.json()
  },

  /**
   * Run a complete forecast using dummy data
   */
  forecastWithDummyData: async (params: {
    profile: string
    metric: string
    days_historical?: number
    days_forecast?: number
    use_ensemble?: boolean
  }) => {
    const { profile, metric, days_historical = 90, days_forecast = 30, use_ensemble = true } = params
    const queryParams = new URLSearchParams({
      days_historical: days_historical.toString(),
      days_forecast: days_forecast.toString(),
      use_ensemble: use_ensemble.toString()
    })

    const res = await fetch(`${FORECASTING_URL}/dummy/forecast/${profile}/${metric}?${queryParams}`, {
      method: 'POST'
    })
    if (!res.ok) throw new Error('Failed to run forecast')
    return res.json()
  },

  /**
   * Get forecasts for a specific metric
   */
  getForecast: async (params: {
    metric: string
    tenantId: string
    days?: number
    use_ensemble?: boolean
  }) => {
    const { metric, tenantId, days = 30, use_ensemble = true } = params
    const queryParams = new URLSearchParams({
      days: days.toString(),
      use_ensemble: use_ensemble.toString()
    })

    const res = await fetch(`${FORECASTING_URL}/forecasts/${metric}?${queryParams}`, {
      headers: {
        'X-Tenant-ID': tenantId
      }
    })
    if (!res.ok) throw new Error('Failed to fetch forecast')
    return res.json()
  },

  /**
   * Health check for forecasting service
   */
  healthCheck: async () => {
    const res = await fetch(`${FORECASTING_URL}/health`)
    if (!res.ok) throw new Error('Forecasting service is down')
    return res.json()
  }
}

// ========================================
// LLM COUNCIL SERVICE API
// ========================================

export const councilAPI = {
  /**
   * Simulate a scenario with the AI Council
   */
  simulateScenario: async (params: {
    presetId: string
    scenarioName: string
    metric: string
    assumptions: Record<string, any>
    debate?: boolean
    tenantId?: string
  }) => {
    const { tenantId = 'test', debate = false, ...body } = params
    const queryParams = new URLSearchParams({ debate: debate.toString() })

    const res = await fetch(`${COUNCIL_URL}/council/simulate/preset?${queryParams}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId
      },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error('Failed to simulate scenario')
    return res.json()
  },

  /**
   * Get available council presets
   */
  getPresets: async () => {
    const res = await fetch(`${COUNCIL_URL}/council/presets`)
    if (!res.ok) throw new Error('Failed to fetch council presets')
    return res.json()
  },

  /**
   * Health check for council service
   */
  healthCheck: async () => {
    const res = await fetch(`${COUNCIL_URL}/health`)
    if (!res.ok) throw new Error('Council service is down')
    return res.json()
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check health of all backend services
 */
export async function checkServicesHealth() {
  const results = {
    forecasting: { status: 'unknown', error: null as string | null },
    council: { status: 'unknown', error: null as string | null }
  }

  try {
    await forecastingAPI.healthCheck()
    results.forecasting.status = 'healthy'
  } catch (error: any) {
    results.forecasting.status = 'unhealthy'
    results.forecasting.error = error.message
  }

  try {
    await councilAPI.healthCheck()
    results.council.status = 'healthy'
  } catch (error: any) {
    results.council.status = 'unhealthy'
    results.council.error = error.message
  }

  return results
}

// ========================================
// TYPES
// ========================================

export interface DummyDataPoint {
  date: string
  value: number
}

export interface DummyDataResponse {
  profile: string
  metric: string
  days: number
  data: DummyDataPoint[]
  summary: {
    first_value: number
    last_value: number
    growth: number
    avg_value: number
  }
}

export interface ForecastPoint {
  date: string
  forecast: number
  lower_bound: number
  upper_bound: number
  confidence: number
}

export interface ForecastResponse {
  test_data: {
    profile: string
    metric: string
    historical_days: number
    forecast_days: number
  }
  training: {
    model_type: string
    duration_seconds: number
    metrics: any
  }
  forecast: {
    trend: string
    predictions: ForecastPoint[]
  }
  note: string
}

export interface CouncilSimulationResponse {
  scenario: {
    name: string
    metric: string
    assumptions: Record<string, any>
  }
  agents: Array<{
    agent: string
    decision: string
    rationale: string
    confidence: number
  }>
  finalDecision: {
    outcome: string
    reasoning: string
    consensus: number
  }
  debate?: {
    turns: Array<{
      agent: string
      message: string
    }>
    finalConsensus: string
  }
}
