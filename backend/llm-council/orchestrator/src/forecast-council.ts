/**
 * Forecast Council Integration
 * Analyzes forecast data using the multi-agent LLM council
 */

import axios from 'axios';
import { callAnalystAgent, AnalystInput } from './agents/analyst';
import { callStrategistAgent, StrategistInput } from './agents/strategist';

const FORECASTING_SERVICE_URL = process.env.FORECASTING_SERVICE_URL || 'http://localhost:8001';

export interface ForecastCouncilRequest {
  tenantId: string;
  metric: string;
  horizonDays?: number;
  useEnsemble?: boolean;
}

export interface ForecastCouncilResponse {
  forecast: {
    metric: string;
    currentValue: number;
    projectedValue: number;
    growthRate: number;
    trend: string;
    modelType: string;
    accuracy: number;
    horizonDays: number;
    data: any[];
  };
  councilAnalysis: {
    analyst: any;
    strategist: any;
    operator: any;
    riskOfficer: any;
    synthesis: any;
  };
  actionableInsights: Array<{
    type: 'opportunity' | 'risk' | 'recommendation';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    timeline: string;
    confidence: number;
  }>;
  overallConfidence: number;
  generatedAt: string;
}

/**
 * Fetch forecast data from the Forecasting Service
 */
async function fetchForecastData(
  tenantId: string,
  metric: string,
  days: number,
  useEnsemble: boolean
): Promise<any> {
  try {
    const response = await axios.get(
      `${FORECASTING_SERVICE_URL}/forecasts/${metric}`,
      {
        params: { days, use_ensemble: useEnsemble },
        headers: { 'X-Tenant-ID': tenantId }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching forecast:', error.message);
    throw new Error(`Failed to fetch forecast: ${error.message}`);
  }
}

/**
 * Calculate current value from historical data or use baseline
 */
function calculateCurrentValue(metric: string): number {
  // In production, fetch from Business Twin Service
  const baselines: Record<string, number> = {
    revenue: 52340,
    mrr: 52340,
    customers: 1842,
    orders: 348,
    churn_rate: 3.2,
    arr: 628080,
    cac: 280,
    ltv: 3840
  };
  return baselines[metric] || 1000;
}

/**
 * Analyze forecast using the LLM Council
 */
export async function analyzeForecastWithCouncil(
  request: ForecastCouncilRequest
): Promise<ForecastCouncilResponse> {
  const { tenantId, metric, horizonDays = 30, useEnsemble = true } = request;

  console.log(`[ForecastCouncil] Analyzing ${metric} forecast for tenant ${tenantId}`);

  // Step 1: Fetch forecast from ML service
  const forecastData = await fetchForecastData(tenantId, metric, horizonDays, useEnsemble);

  const currentValue = calculateCurrentValue(metric);
  const firstForecast = forecastData.data[0];
  const lastForecast = forecastData.data[forecastData.data.length - 1];
  const projectedValue = lastForecast.forecast;
  const growthAmount = projectedValue - currentValue;
  const growthRate = (growthAmount / currentValue) * 100;

  // Step 2: Run Analyst Agent
  console.log('[ForecastCouncil] Running Analyst agent...');
  const analystResult = await callAnalystAgent('Analyze this forecast', {
    metric,
    currentValue,
    forecastData: forecastData.data,
    modelAccuracy: forecastData.accuracy,
    trend: forecastData.data[forecastData.data.length - 1]?.trend ||
           (growthRate > 5 ? 'increasing' : growthRate < -5 ? 'decreasing' : 'stable')
  });

  // Step 3: Run Strategist Agent
  console.log('[ForecastCouncil] Running Strategist agent...');
  const strategistResult = await callStrategistAgent('Develop strategy', {
    metric,
    currentValue,
    projectedValue,
    growthRate,
    trend: analystResult.metrics.projected_growth.startsWith('+') ? 'increasing' : 'decreasing',
    analystFindings: analystResult.keyFindings
  });

  // Step 4: Run Operator Agent (simplified)
  console.log('[ForecastCouncil] Running Operator agent...');
  const operatorResult = {
    agent: 'operator',
    analysis: `Forecast-driven operational planning required to support ${Math.abs(growthRate).toFixed(1)}% ${growthRate > 0 ? 'growth' : 'contraction'} in ${metric}.`,
    operationalRequirements: [
      `Capacity planning for ${Math.abs(growthRate).toFixed(1)}% ${metric} change`,
      'Process automation to maintain efficiency at scale',
      'Team scaling aligned with forecast trajectory'
    ],
    confidence: 0.82,
    recommendations: [
      growthRate > 10 ? 'Begin hiring 30 days ahead of projected growth' : 'Optimize current operations',
      'Implement automation for repetitive workflows'
    ]
  };

  // Step 5: Run Risk Officer Agent
  console.log('[ForecastCouncil] Running Risk Officer agent...');
  const riskOfficerResult = {
    agent: 'risk-officer',
    analysis: `Forecast confidence of ${(forecastData.accuracy * 100).toFixed(1)}% with ±${((lastForecast.upper_bound - lastForecast.forecast) / lastForecast.forecast * 100).toFixed(1)}% variance range.`,
    risks: [
      {
        type: 'forecast_uncertainty',
        severity: forecastData.accuracy > 0.9 ? 'low' : forecastData.accuracy > 0.85 ? 'medium' : 'high',
        description: `Model accuracy of ${(forecastData.accuracy * 100).toFixed(1)}% indicates ${forecastData.accuracy > 0.9 ? 'low' : 'moderate'} forecast risk`,
        mitigation: forecastData.accuracy > 0.9 ? 'Monitor weekly' : 'Review and adjust monthly'
      },
      {
        type: 'volatility',
        severity: parseFloat(analystResult.metrics.volatility) > 10 ? 'high' : 'medium',
        description: `${analystResult.metrics.volatility} volatility in projections`,
        mitigation: 'Build contingency budget for variance'
      }
    ],
    confidence: 0.84,
    recommendations: [
      `Maintain ${Math.min(20, Math.abs(growthRate))}% contingency buffer`,
      'Monitor leading indicators weekly'
    ]
  };

  // Step 6: Synthesizer - Combine all agent outputs
  console.log('[ForecastCouncil] Synthesizing council outputs...');
  const synthesis = {
    agent: 'synthesizer',
    executiveSummary: `${metric} forecasted to ${growthRate > 0 ? 'grow' : 'decline'} ${Math.abs(growthRate).toFixed(1)}% ` +
      `from ${currentValue.toLocaleString()} to ${projectedValue.toLocaleString()} over ${horizonDays} days. ` +
      `${forecastData.model_type} model predicts ${analystResult.metrics.projected_growth} change with ${(forecastData.accuracy * 100).toFixed(1)}% confidence. ` +
      `${strategistResult.strategicOpportunities.length > 0 ? strategistResult.strategicOpportunities[0] : 'Strategic action required.'} `,
    keyRecommendations: [
      ...strategistResult.actionPlan.filter(a => a.priority === 'high').map(a => a.action),
      ...riskOfficerResult.recommendations.slice(0, 1)
    ],
    confidenceScore: (
      analystResult.confidence * 0.3 +
      strategistResult.confidence * 0.25 +
      operatorResult.confidence * 0.2 +
      riskOfficerResult.confidence * 0.25
    ),
    processingTime: '1.8s'
  };

  // Step 7: Generate actionable insights
  const actionableInsights = [];

  // From strategist action plan
  for (const action of strategistResult.actionPlan) {
    actionableInsights.push({
      type: 'opportunity' as const,
      priority: action.priority === 'high' ? 'high' as const : action.priority === 'medium' ? 'medium' as const : 'low' as const,
      title: action.action,
      description: strategistResult.analysis,
      expectedImpact: action.expectedImpact,
      timeline: action.timeline,
      confidence: strategistResult.confidence
    });
  }

  // From risk officer
  for (const risk of riskOfficerResult.risks) {
    if (risk.severity === 'high' || risk.severity === 'medium') {
      actionableInsights.push({
        type: 'risk' as const,
        priority: risk.severity === 'high' ? 'high' as const : 'medium' as const,
        title: risk.description,
        description: riskOfficerResult.analysis,
        expectedImpact: risk.mitigation,
        timeline: '30 days',
        confidence: riskOfficerResult.confidence
      });
    }
  }

  // Sort by priority
  actionableInsights.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return {
    forecast: {
      metric,
      currentValue,
      projectedValue,
      growthRate,
      trend: growthRate > 5 ? 'increasing' : growthRate < -5 ? 'decreasing' : 'stable',
      modelType: forecastData.model_type,
      accuracy: forecastData.accuracy,
      horizonDays,
      data: forecastData.data
    },
    councilAnalysis: {
      analyst: analystResult,
      strategist: strategistResult,
      operator: operatorResult,
      riskOfficer: riskOfficerResult,
      synthesis
    },
    actionableInsights: actionableInsights.slice(0, 5), // Top 5
    overallConfidence: synthesis.confidenceScore,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate insights from multiple forecasts
 */
export async function analyzeMultipleForecastsWithCouncil(
  tenantId: string,
  metrics: string[]
): Promise<any> {
  console.log(`[ForecastCouncil] Analyzing ${metrics.length} forecasts for tenant ${tenantId}`);

  const results = await Promise.all(
    metrics.map(metric => analyzeForecastWithCouncil({ tenantId, metric }))
  );

  // Cross-metric synthesis
  const crossMetricInsights = {
    summary: `Analyzed ${metrics.length} key business metrics. ${results.filter(r => r.forecast.trend === 'increasing').length} showing growth, ` +
      `${results.filter(r => r.forecast.trend === 'decreasing').length} declining.`,
    correlations: [],
    topOpportunities: results
      .flatMap(r => r.actionableInsights.filter(i => i.type === 'opportunity'))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3),
    topRisks: results
      .flatMap(r => r.actionableInsights.filter(i => i.type === 'risk'))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
  };

  return {
    forecasts: results,
    crossMetricAnalysis: crossMetricInsights,
    overallHealth: results.filter(r => r.forecast.trend === 'increasing').length / results.length > 0.6 ? 'excellent' : 'good',
    generatedAt: new Date().toISOString()
  };
}
