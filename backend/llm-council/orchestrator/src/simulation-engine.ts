/**
 * Simulation Engine for LLM Council
 *
 * Allows configuring agents with different roles, weights, and perspectives
 * to simulate decision-making under various scenarios
 */

import { callAnalystAgent } from './agents/analyst';
import { callStrategistAgent } from './agents/strategist';
import { generateDebateConversation, AgentDebate } from './agent-conversation';
import axios from 'axios';

const FORECASTING_SERVICE_URL = process.env.FORECASTING_SERVICE_URL || 'http://localhost:8001';

export interface AgentConfig {
  agent: 'analyst' | 'strategist' | 'operator' | 'risk-officer' | 'industry-expert' | 'cfo' | 'ceo';
  weight: number; // 0-1, how much influence this agent has in final decision
  perspective: 'aggressive' | 'conservative' | 'balanced' | 'data-driven';
  riskTolerance: 'low' | 'medium' | 'high';
  enabled: boolean;
}

export interface SimulationScenario {
  name: string;
  description: string;
  metric: string;
  assumptions: {
    [key: string]: number; // e.g., { "price_increase": 0.10, "churn_impact": 0.05 }
  };
  agentConfigs: AgentConfig[];
  decisionFramework: 'consensus' | 'weighted-vote' | 'ceo-final-say' | 'risk-adjusted';
}

export interface SimulationResult {
  scenario: SimulationScenario;
  forecastData: any;
  agentDecisions: Array<{
    agent: string;
    decision: 'approve' | 'reject' | 'conditional';
    reasoning: string;
    confidence: number;
    concerns: string[];
    requirements: string[];
  }>;
  finalDecision: {
    outcome: 'approved' | 'rejected' | 'needs-modification';
    reasoning: string;
    votes: {
      approve: number;
      reject: number;
      conditional: number;
    };
    confidence: number;
    modifications: string[];
  };
  alternativeScenarios: Array<{
    suggestion: string;
    expectedOutcome: string;
    proposedBy: string;
  }>;
  debate?: AgentDebate;  // Optional: Full conversation transcript
  generatedAt: string;
}

/**
 * Simulate a business decision using the LLM Council
 */
export async function simulateDecision(
  tenantId: string,
  scenario: SimulationScenario,
  options: { includeDebate?: boolean } = {}
): Promise<SimulationResult> {
  console.log(`[Simulation] Running scenario: "${scenario.name}"`);

  // Step 1: Fetch forecast data with scenario assumptions
  const forecastData = await fetchScenarioForecast(tenantId, scenario);

  // Step 2: Each agent evaluates the scenario based on their config
  const agentDecisions = await evaluateWithAgents(scenario, forecastData);

  // Step 3: Apply decision framework to reach final decision
  const finalDecision = applyDecisionFramework(scenario, agentDecisions);

  // Step 4: Generate alternative scenarios
  const alternativeScenarios = generateAlternatives(scenario, agentDecisions);

  // Step 5: Generate debate conversation (optional)
  let debate: AgentDebate | undefined;
  if (options.includeDebate) {
    debate = generateDebateConversation(
      scenario,
      agentDecisions,
      { scenario, forecastData, businessContext: {} }
    );
  }

  return {
    scenario,
    forecastData,
    agentDecisions,
    finalDecision,
    alternativeScenarios,
    debate,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Fetch forecast with scenario assumptions applied
 */
async function fetchScenarioForecast(
  tenantId: string,
  scenario: SimulationScenario
): Promise<any> {
  // In production, this would adjust the forecast based on assumptions
  // For now, fetch base forecast
  try {
    const response = await axios.get(
      `${FORECASTING_SERVICE_URL}/forecasts/${scenario.metric}`,
      {
        params: { days: 30, use_ensemble: true },
        headers: { 'X-Tenant-ID': tenantId }
      }
    );

    const baseForecast = response.data;

    // Apply scenario assumptions to forecast
    const adjustedData = baseForecast.data.map((point: any, index: number) => {
      let adjustedForecast = point.forecast;

      // Apply each assumption
      for (const [key, value] of Object.entries(scenario.assumptions)) {
        if (key.includes('increase') || key.includes('growth')) {
          adjustedForecast *= (1 + value);
        } else if (key.includes('decrease') || key.includes('decline')) {
          adjustedForecast *= (1 - value);
        }
      }

      return {
        ...point,
        forecast: adjustedForecast,
        scenario_adjusted: true,
        assumptions: scenario.assumptions
      };
    });

    return {
      ...baseForecast,
      data: adjustedData,
      scenario: scenario.name,
      assumptions: scenario.assumptions
    };
  } catch (error) {
    console.error('Error fetching scenario forecast:', error);
    throw error;
  }
}

/**
 * Each agent evaluates the scenario based on their configuration
 */
async function evaluateWithAgents(
  scenario: SimulationScenario,
  forecastData: any
): Promise<any[]> {
  const decisions = [];

  for (const agentConfig of scenario.agentConfigs) {
    if (!agentConfig.enabled) continue;

    const decision = await evaluateScenarioAsAgent(agentConfig, scenario, forecastData);
    decisions.push(decision);
  }

  return decisions;
}

/**
 * Agent evaluates scenario based on their role and perspective
 */
async function evaluateScenarioAsAgent(
  config: AgentConfig,
  scenario: SimulationScenario,
  forecastData: any
): Promise<any> {
  const { agent, perspective, riskTolerance } = config;

  const firstForecast = forecastData.data[0].forecast;
  const lastForecast = forecastData.data[forecastData.data.length - 1].forecast;
  const growthRate = ((lastForecast - firstForecast) / firstForecast) * 100;

  let decision: 'approve' | 'reject' | 'conditional' = 'approve';
  let reasoning = '';
  const concerns: string[] = [];
  const requirements: string[] = [];
  let confidence = 0.85;

  // Agent-specific evaluation logic
  switch (agent) {
    case 'analyst':
      if (Math.abs(growthRate) > 20 && forecastData.accuracy < 0.85) {
        decision = 'conditional';
        concerns.push('High growth projection with lower model confidence');
        requirements.push('Validate assumptions with additional data sources');
      }
      reasoning = `Based on ${forecastData.model_type} forecast with ${(forecastData.accuracy * 100).toFixed(1)}% accuracy, ` +
        `projecting ${growthRate.toFixed(1)}% change. ${decision === 'approve' ? 'Data supports scenario' : 'Concerns exist'}.`;
      break;

    case 'strategist':
      if (perspective === 'aggressive' && growthRate > 10) {
        decision = 'approve';
        reasoning = `Strong growth opportunity aligns with aggressive growth strategy. Recommend full execution.`;
        confidence = 0.90;
      } else if (perspective === 'conservative' && growthRate > 25) {
        decision = 'conditional';
        concerns.push('Growth rate may be overly optimistic');
        requirements.push('Phase implementation to reduce risk');
        reasoning = `Conservative approach recommends phased rollout to validate assumptions.`;
        confidence = 0.75;
      } else {
        decision = 'approve';
        reasoning = `Scenario aligns with ${perspective} strategic approach.`;
      }
      break;

    case 'risk-officer':
      const riskScore = calculateRiskScore(scenario, forecastData, riskTolerance);

      if (riskScore > 0.7 && riskTolerance === 'low') {
        decision = 'reject';
        concerns.push('Risk level exceeds organizational tolerance');
        reasoning = `Risk score ${(riskScore * 100).toFixed(0)}% exceeds low-risk threshold. Not recommended.`;
        confidence = 0.88;
      } else if (riskScore > 0.5) {
        decision = 'conditional';
        concerns.push('Moderate to high risk identified');
        requirements.push('Implement risk mitigation strategies');
        requirements.push('Set up monitoring and kill switches');
        reasoning = `Acceptable with risk mitigation measures in place.`;
        confidence = 0.80;
      } else {
        decision = 'approve';
        reasoning = `Risk level ${(riskScore * 100).toFixed(0)}% within acceptable range.`;
        confidence = 0.85;
      }
      break;

    case 'operator':
      const operationalCapacity = assessOperationalCapacity(growthRate, scenario);

      if (operationalCapacity < 0.6) {
        decision = 'reject';
        concerns.push('Insufficient operational capacity for this scenario');
        reasoning = `Current operations cannot support ${growthRate.toFixed(1)}% change without significant investment.`;
      } else if (operationalCapacity < 0.8) {
        decision = 'conditional';
        requirements.push('Hire additional team members 60 days in advance');
        requirements.push('Implement process automation');
        reasoning = `Operationally feasible with advance preparation.`;
      } else {
        decision = 'approve';
        reasoning = `Existing operations can support this scenario.`;
      }
      break;

    case 'cfo':
      const financialImpact = calculateFinancialImpact(scenario, forecastData);

      if (financialImpact.roi < 1.5 && perspective === 'conservative') {
        decision = 'reject';
        concerns.push(`ROI of ${financialImpact.roi.toFixed(1)}x below 1.5x threshold`);
        reasoning = `Financial returns do not justify investment.`;
      } else if (financialImpact.roi < 2.5 && perspective === 'aggressive') {
        decision = 'conditional';
        requirements.push('Optimize costs to improve ROI');
        reasoning = `Proceed with cost optimization to reach 2.5x ROI target.`;
      } else {
        decision = 'approve';
        reasoning = `ROI of ${financialImpact.roi.toFixed(1)}x meets financial criteria. NPV: $${financialImpact.npv.toLocaleString()}.`;
      }
      break;

    case 'ceo':
      // CEO considers all factors holistically
      const strategicAlignment = growthRate > 15 ? 0.9 : growthRate > 5 ? 0.7 : 0.5;

      if (strategicAlignment > 0.8 && forecastData.accuracy > 0.85) {
        decision = 'approve';
        reasoning = `Strong strategic alignment with high confidence. Approve for immediate execution.`;
        confidence = 0.92;
      } else if (strategicAlignment > 0.6) {
        decision = 'conditional';
        requirements.push('Address team concerns before proceeding');
        reasoning = `Strategically sound with some adjustments needed.`;
        confidence = 0.80;
      } else {
        decision = 'reject';
        reasoning = `Does not align with current strategic priorities.`;
        confidence = 0.75;
      }
      break;

    default:
      decision = 'approve';
      reasoning = 'Standard evaluation completed.';
  }

  return {
    agent,
    decision,
    reasoning,
    confidence,
    concerns,
    requirements,
    perspective,
    riskTolerance,
    weight: config.weight
  };
}

/**
 * Calculate risk score for scenario
 */
function calculateRiskScore(
  scenario: SimulationScenario,
  forecastData: any,
  riskTolerance: string
): number {
  let risk = 0;

  // Forecast uncertainty
  const modelRisk = 1 - forecastData.accuracy;
  risk += modelRisk * 0.3;

  // Assumption aggressiveness
  const assumptionRisk = Object.values(scenario.assumptions).reduce((sum: number, val: any) => {
    return sum + Math.abs(val);
  }, 0) / Object.keys(scenario.assumptions).length;
  risk += Math.min(assumptionRisk, 0.5) * 0.4;

  // Volatility risk
  const volatility = 0.1; // Placeholder - would calculate from forecast data
  risk += volatility * 0.3;

  return Math.min(risk, 1);
}

/**
 * Assess operational capacity to handle scenario
 */
function assessOperationalCapacity(growthRate: number, scenario: SimulationScenario): number {
  // Simplified: inverse relationship with growth magnitude
  const baseCapacity = 0.9;
  const growthImpact = Math.abs(growthRate) / 100;
  return Math.max(baseCapacity - growthImpact, 0.2);
}

/**
 * Calculate financial impact
 */
function calculateFinancialImpact(scenario: SimulationScenario, forecastData: any) {
  const firstValue = forecastData.data[0].forecast;
  const lastValue = forecastData.data[forecastData.data.length - 1].forecast;
  const revenue = lastValue - firstValue;

  // Simplified ROI calculation
  const investment = Math.abs(revenue) * 0.3; // Assume 30% cost
  const roi = revenue / investment;
  const npv = revenue - investment;

  return { roi, npv, revenue, investment };
}

/**
 * Apply decision framework to reach final decision
 */
function applyDecisionFramework(
  scenario: SimulationScenario,
  agentDecisions: any[]
): any {
  const { decisionFramework } = scenario;

  let outcome: 'approved' | 'rejected' | 'needs-modification' = 'approved';
  let reasoning = '';
  const votes = { approve: 0, reject: 0, conditional: 0 };
  const modifications: string[] = [];

  // Count votes
  agentDecisions.forEach(d => {
    votes[d.decision]++;
    if (d.requirements.length > 0) {
      modifications.push(...d.requirements);
    }
  });

  switch (decisionFramework) {
    case 'consensus':
      // All must approve
      if (votes.reject > 0) {
        outcome = 'rejected';
        reasoning = 'Consensus not reached. At least one agent rejected.';
      } else if (votes.conditional > 0) {
        outcome = 'needs-modification';
        reasoning = 'Consensus requires modifications to address concerns.';
      } else {
        outcome = 'approved';
        reasoning = 'Unanimous approval from all agents.';
      }
      break;

    case 'weighted-vote':
      // Weighted by agent importance
      let approvalScore = 0;
      agentDecisions.forEach(d => {
        if (d.decision === 'approve') approvalScore += d.weight;
        if (d.decision === 'conditional') approvalScore += d.weight * 0.5;
      });

      if (approvalScore >= 0.7) {
        outcome = 'approved';
        reasoning = `Weighted approval score ${(approvalScore * 100).toFixed(0)}% exceeds 70% threshold.`;
      } else if (approvalScore >= 0.5) {
        outcome = 'needs-modification';
        reasoning = `Weighted score ${(approvalScore * 100).toFixed(0)}% requires modifications.`;
      } else {
        outcome = 'rejected';
        reasoning = `Weighted score ${(approvalScore * 100).toFixed(0)}% below approval threshold.`;
      }
      break;

    case 'ceo-final-say':
      // CEO decision overrides all
      const ceoDecision = agentDecisions.find(d => d.agent === 'ceo');
      if (ceoDecision) {
        outcome = ceoDecision.decision === 'approve' ? 'approved' :
                  ceoDecision.decision === 'reject' ? 'rejected' : 'needs-modification';
        reasoning = `CEO decision: ${ceoDecision.reasoning}`;
      } else {
        // Fallback to majority vote
        outcome = votes.approve > votes.reject ? 'approved' : 'rejected';
        reasoning = 'Majority vote (no CEO in council).';
      }
      break;

    case 'risk-adjusted':
      // Risk officer has veto power, others vote
      const riskOfficer = agentDecisions.find(d => d.agent === 'risk-officer');
      if (riskOfficer && riskOfficer.decision === 'reject') {
        outcome = 'rejected';
        reasoning = `Risk officer veto: ${riskOfficer.reasoning}`;
      } else if (votes.approve > votes.reject) {
        outcome = votes.conditional > 0 ? 'needs-modification' : 'approved';
        reasoning = `Risk-adjusted approval. ${votes.approve} approve, ${votes.reject} reject.`;
      } else {
        outcome = 'rejected';
        reasoning = 'Majority rejection in risk-adjusted framework.';
      }
      break;
  }

  const totalWeight = agentDecisions.reduce((sum, d) => sum + d.weight, 0);
  const weightedConfidence = agentDecisions.reduce((sum, d) =>
    sum + (d.confidence * d.weight), 0) / totalWeight;

  return {
    outcome,
    reasoning,
    votes,
    confidence: weightedConfidence,
    modifications: [...new Set(modifications)] // Deduplicate
  };
}

/**
 * Generate alternative scenarios based on agent feedback
 */
function generateAlternatives(
  scenario: SimulationScenario,
  agentDecisions: any[]
): any[] {
  const alternatives = [];

  // From concerns and requirements
  const allConcerns = agentDecisions.flatMap(d => d.concerns);
  const allRequirements = agentDecisions.flatMap(d => d.requirements);

  if (allConcerns.some(c => c.includes('risk') || c.includes('aggressive'))) {
    alternatives.push({
      suggestion: 'Phase implementation over 90 days instead of immediate rollout',
      expectedOutcome: 'Reduced risk with validated assumptions',
      proposedBy: 'Risk Officer'
    });
  }

  if (allRequirements.some(r => r.includes('hire') || r.includes('team'))) {
    alternatives.push({
      suggestion: 'Delay launch by 60 days to build team capacity',
      expectedOutcome: 'Higher success probability with adequate resources',
      proposedBy: 'Operator'
    });
  }

  if (allConcerns.some(c => c.includes('ROI') || c.includes('financial'))) {
    alternatives.push({
      suggestion: 'Optimize cost structure to improve ROI by 30%',
      expectedOutcome: 'Meet financial hurdle rate of 2.5x ROI',
      proposedBy: 'CFO'
    });
  }

  return alternatives;
}

/**
 * Preset council configurations for common decision scenarios
 */
export const PRESET_COUNCILS = {
  startup_aggressive: {
    name: 'Startup - Aggressive Growth',
    agentConfigs: [
      { agent: 'analyst' as const, weight: 0.2, perspective: 'data-driven' as const, riskTolerance: 'high' as const, enabled: true },
      { agent: 'strategist' as const, weight: 0.3, perspective: 'aggressive' as const, riskTolerance: 'high' as const, enabled: true },
      { agent: 'ceo' as const, weight: 0.5, perspective: 'aggressive' as const, riskTolerance: 'high' as const, enabled: true }
    ],
    decisionFramework: 'ceo-final-say' as const
  },

  enterprise_conservative: {
    name: 'Enterprise - Risk-Averse',
    agentConfigs: [
      { agent: 'analyst' as const, weight: 0.25, perspective: 'data-driven' as const, riskTolerance: 'low' as const, enabled: true },
      { agent: 'risk-officer' as const, weight: 0.3, perspective: 'conservative' as const, riskTolerance: 'low' as const, enabled: true },
      { agent: 'cfo' as const, weight: 0.25, perspective: 'conservative' as const, riskTolerance: 'low' as const, enabled: true },
      { agent: 'operator' as const, weight: 0.2, perspective: 'balanced' as const, riskTolerance: 'medium' as const, enabled: true }
    ],
    decisionFramework: 'consensus' as const
  },

  balanced_growth: {
    name: 'Balanced Growth',
    agentConfigs: [
      { agent: 'analyst' as const, weight: 0.2, perspective: 'data-driven' as const, riskTolerance: 'medium' as const, enabled: true },
      { agent: 'strategist' as const, weight: 0.25, perspective: 'balanced' as const, riskTolerance: 'medium' as const, enabled: true },
      { agent: 'risk-officer' as const, weight: 0.2, perspective: 'balanced' as const, riskTolerance: 'medium' as const, enabled: true },
      { agent: 'cfo' as const, weight: 0.2, perspective: 'balanced' as const, riskTolerance: 'medium' as const, enabled: true },
      { agent: 'operator' as const, weight: 0.15, perspective: 'balanced' as const, riskTolerance: 'medium' as const, enabled: true }
    ],
    decisionFramework: 'weighted-vote' as const
  }
};
