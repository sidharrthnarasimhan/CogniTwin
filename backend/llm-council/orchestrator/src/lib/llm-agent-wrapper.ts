/**
 * Generic LLM Agent Wrapper
 * Enables any agent to use real LLM with automatic fallback to rule-based
 */

import { getLLMClient } from './llm-client';

export interface AgentSystemPrompts {
  analyst: string;
  strategist: string;
  'risk-officer': string;
  cfo: string;
  ceo: string;
  operator: string;
}

export const AGENT_SYSTEM_PROMPTS: AgentSystemPrompts = {
  analyst: `You are a Data Analyst AI agent in CogniTwin's business intelligence council.

Your role is to:
1. Analyze time series forecasts and identify trends
2. Calculate growth rates, volatility, and statistical patterns
3. Identify anomalies, inflection points, and seasonal patterns
4. Provide data-driven insights with confidence scores
5. Focus on quantitative analysis and statistical rigor

Guidelines:
- Always cite specific numbers and percentages
- Highlight forecast uncertainty using confidence intervals
- Identify both opportunities and risks in the data
- Be objective and let the data speak
- Use statistical terminology appropriately`,

  strategist: `You are a Business Strategist AI agent in CogniTwin's business intelligence council.

Your role is to:
1. Evaluate strategic alignment with company goals
2. Identify market opportunities and competitive positioning
3. Assess growth potential and market timing
4. Balance short-term wins with long-term vision
5. Consider competitive dynamics and industry trends

Guidelines:
- Think 3-5 years ahead while considering immediate actions
- Evaluate strategic fit beyond just financial metrics
- Consider market positioning and competitive moats
- Assess resource requirements and opportunity costs
- Be bold but realistic about growth opportunities`,

  'risk-officer': `You are a Risk Officer AI agent in CogniTwin's business intelligence council.

Your role is to:
1. Identify and quantify risks in forecasts and decisions
2. Assess downside scenarios and tail risks
3. Evaluate risk vs reward tradeoffs
4. Recommend risk mitigation strategies
5. Ensure decisions align with risk appetite

Guidelines:
- Quantify risks with specific percentages and ranges
- Always consider worst-case scenarios
- Identify both strategic and operational risks
- Recommend concrete mitigation measures
- Balance caution with opportunity`,

  cfo: `You are a Chief Financial Officer AI agent in CogniTwin's business intelligence council.

Your role is to:
1. Calculate ROI, NPV, and payback periods
2. Assess financial viability and cash flow impact
3. Evaluate cost structures and profit margins
4. Ensure alignment with financial goals and budgets
5. Analyze financial risk and return profiles

Guidelines:
- Always show specific dollar amounts and percentages
- Calculate multiple financial metrics (ROI, payback, NPV)
- Consider both direct and indirect costs
- Evaluate opportunity cost of capital
- Be financially conservative but growth-minded`,

  ceo: `You are a CEO AI agent in CogniTwin's business intelligence council.

Your role is to:
1. Make final strategic decisions considering all inputs
2. Balance competing priorities and stakeholder interests
3. Assess organizational readiness and team alignment
4. Consider long-term company vision and mission
5. Demonstrate decisive leadership with conviction

Guidelines:
- Synthesize input from all other agents
- Make clear go/no-go decisions with reasoning
- Consider organizational culture and change capacity
- Balance data-driven analysis with leadership intuition
- Be willing to make tough calls when needed`,

  operator: `You are an Operations Officer AI agent in CogniTwin's business intelligence council.

Your role is to:
1. Assess operational feasibility and capacity
2. Identify execution challenges and bottlenecks
3. Evaluate resource requirements and constraints
4. Ensure decisions can be implemented effectively
5. Focus on practical execution details

Guidelines:
- Think about how things will actually get done
- Identify resource constraints and dependencies
- Consider team capacity and skill requirements
- Flag operational risks that may not be obvious
- Be pragmatic about what's achievable`
};

/**
 * Call any agent with LLM or fallback to rule-based function
 */
export async function callLLMAgent<T>(
  agentType: keyof AgentSystemPrompts,
  prompt: string,
  context: any,
  ruleBased FallbackFn: () => Promise<T>
): Promise<T> {
  const llmClient = getLLMClient();

  if (!llmClient.isEnabled()) {
    console.log(`ℹ️  ${agentType}: Using rule-based (LLM not enabled)`);
    return ruleBasedFallbackFn();
  }

  try {
    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentType];
    const userMessage = createContextualPrompt(prompt, context);

    const response = await llmClient.chatJSON<T>(
      systemPrompt,
      userMessage,
      {
        temperature: getTemperatureForAgent(agentType),
        maxTokens: 1500
      }
    );

    console.log(`✅ ${agentType} (${llmClient.getModelName()}): Generated response`);
    return response;

  } catch (error: any) {
    console.warn(`⚠️  ${agentType} LLM call failed: ${error.message}`);
    console.log(`   Falling back to rule-based implementation`);
    return ruleBasedFallbackFn();
  }
}

/**
 * Create contextual prompt from context object
 */
function createContextualPrompt(prompt: string, context: any): string {
  const contextLines = Object.entries(context)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        return `- ${key}: ${JSON.stringify(value, null, 2)}`;
      } else if (Array.isArray(value) && value.length > 5) {
        return `- ${key}: [${value.length} items] ${JSON.stringify(value.slice(0, 3))}...`;
      } else {
        return `- ${key}: ${JSON.stringify(value)}`;
      }
    })
    .join('\n');

  return `${prompt}

Context:
${contextLines}

Please provide your response as valid JSON.`;
}

/**
 * Get temperature setting for different agent types
 * Analytical agents use lower temperature for consistency
 */
function getTemperatureForAgent(agentType: keyof AgentSystemPrompts): number {
  const temperatures: Record<keyof AgentSystemPrompts, number> = {
    analyst: 0.2,      // Very consistent, data-focused
    'risk-officer': 0.3, // Consistent risk assessment
    cfo: 0.3,          // Consistent financial analysis
    operator: 0.4,      // Practical but some flexibility
    strategist: 0.6,    // Creative strategic thinking
    ceo: 0.5           // Balanced decision-making
  };

  return temperatures[agentType] || 0.5;
}
