import OpenAI from 'openai';
import { getModelRegistry, ModelMessage } from './model-loader';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key'
});

// Flag to enable/disable dynamic model loading
const USE_DYNAMIC_MODELS = process.env.USE_DYNAMIC_MODELS === 'true';

// Path to council roles configuration
const COUNCIL_ROLES_PATH = path.join(process.cwd(), '../../frontend/web/config/council-roles.json');

interface AnalysisRequest {
  context: string;
  question: string;
  twinState: any;
  tenantId: string;
}

interface AgentResponse {
  agent: string;
  analysis: string;
  confidence: number;
  recommendations: string[];
}

interface CouncilRole {
  id: string;
  title: string;
  modelId: string | null;
  enhancedPrompt?: string;
  prompt: string;
  personality: Record<string, number>;
  traits: Array<{
    name: string;
    left: string;
    right: string;
    description: string;
  }>;
}

function loadCouncilRoles(): CouncilRole[] {
  try {
    if (fs.existsSync(COUNCIL_ROLES_PATH)) {
      const data = fs.readFileSync(COUNCIL_ROLES_PATH, 'utf-8');
      const roles = JSON.parse(data);
      console.log(`Loaded ${roles.length} council roles with personality configurations`);
      return roles;
    }
  } catch (error) {
    console.error('Error loading council roles:', error);
  }

  // Return default roles if config not found
  return [];
}

export const getAgentPrompts = () => ({
  analyst: `You are a Data Analyst AI agent in a business intelligence council.
Analyze metrics, identify trends, patterns, and correlations.
Provide data-driven insights with confidence scores.`,

  strategist: `You are a Business Strategist AI agent.
Focus on growth opportunities, market positioning, and strategic recommendations.
Provide actionable strategic insights.`,

  operator: `You are an Operations Expert AI agent.
Analyze operational efficiency, process optimization, and workflow improvements.
Suggest practical operational enhancements.`,

  'risk-officer': `You are a Risk Officer AI agent.
Identify potential risks, threats, and vulnerabilities.
Provide risk mitigation strategies and compliance recommendations.`,

  'industry-expert': `You are an Industry Expert AI agent.
Apply industry-specific knowledge, best practices, and benchmarks.
Provide context-aware industry insights.`,

  synthesizer: `You are an Insight Synthesizer AI agent.
Your role is to synthesize inputs from all other agents into cohesive, prioritized, actionable insights.
Create a clear executive summary with recommended actions.`
});

async function callAgent(agent: string, prompt: string, context: any, role?: CouncilRole): Promise<AgentResponse> {
  // Try to use dynamic models with personality-enhanced prompts
  if (USE_DYNAMIC_MODELS && role) {
    try {
      const registry = getModelRegistry();

      // Get role-specific model if assigned, otherwise use default
      const model = role.modelId
        ? await registry.getModel(role.modelId)
        : await registry.getModel();

      if (model) {
        // Use personality-enhanced prompt if available
        const agentPrompt = role.enhancedPrompt || role.prompt;

        const messages: ModelMessage[] = [
          { role: 'system', content: agentPrompt },
          { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${prompt}\n\nProvide analysis from your perspective as ${role.title}, considering your personality traits. Include confidence score and recommendations.` }
        ];

        const response = await model.generate(messages, { temperature: 0.7, maxTokens: 1000 });

        console.log(`${role.title} responded using ${role.modelId || 'default model'} with personality traits`);

        // Parse the response (simplified - in production would be more robust)
        return {
          agent,
          analysis: response,
          confidence: 0.85, // Would extract from response
          recommendations: ['Recommendation from AI model'] // Would extract from response
        };
      }
    } catch (error) {
      console.error(`Error calling dynamic model for ${agent}:`, error);
      // Fall through to mock responses
    }
  } else if (USE_DYNAMIC_MODELS) {
    // Fallback to old behavior for backward compatibility
    try {
      const registry = getModelRegistry();
      const model = await registry.getModel();

      if (model) {
        const agentPrompt = getAgentPrompts()[agent as keyof ReturnType<typeof getAgentPrompts>];

        const messages: ModelMessage[] = [
          { role: 'system', content: agentPrompt },
          { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${prompt}\n\nProvide analysis, confidence score (0-1), and recommendations.` }
        ];

        const response = await model.generate(messages, { temperature: 0.7, maxTokens: 1000 });

        return {
          agent,
          analysis: response,
          confidence: 0.85,
          recommendations: ['Recommendation from AI model']
        };
      }
    } catch (error) {
      console.error(`Error calling dynamic model for ${agent}:`, error);
    }
  }

  // Mock implementation - fallback when dynamic models not available
  const mockResponses: Record<string, AgentResponse> = {
    analyst: {
      agent: 'analyst',
      analysis: 'Revenue trend shows 12.5% month-over-month growth. Customer acquisition cost is stable at $280. LTV/CAC ratio of 13.7 indicates healthy unit economics.',
      confidence: 0.89,
      recommendations: [
        'Monitor MRR growth trajectory',
        'Track cohort retention metrics',
        'Analyze customer segment performance'
      ]
    },
    strategist: {
      agent: 'strategist',
      analysis: 'Enterprise segment shows 40% higher engagement and 2.3x spend vs SMB. Significant upsell opportunity exists.',
      confidence: 0.85,
      recommendations: [
        'Launch enterprise-focused upsell campaign',
        'Create premium tier at $499/mo',
        'Invest in enterprise sales team'
      ]
    },
    operator: {
      agent: 'operator',
      analysis: 'Support resolution time down 18%. Onboarding completion rate at 78%. Opportunity to automate repetitive tasks.',
      confidence: 0.82,
      recommendations: [
        'Implement AI-powered support triage',
        'Create self-service knowledge base',
        'Automate onboarding workflows'
      ]
    },
    'risk-officer': {
      agent: 'risk-officer',
      analysis: 'Churn risk detected in Starter tier (15% usage decline). 127 customers at risk representing $8.2k MRR.',
      confidence: 0.84,
      recommendations: [
        'Launch proactive retention campaign',
        'Offer personalized onboarding',
        'Monitor usage patterns weekly'
      ]
    },
    'industry-expert': {
      agent: 'industry-expert',
      analysis: 'Industry benchmark CAC is $320, you\'re at $280 (12% better). Churn rate of 3.2% is below industry average of 5-7%.',
      confidence: 0.88,
      recommendations: [
        'Leverage competitive advantage in CAC',
        'Study retention best practices',
        'Benchmark against top quartile'
      ]
    },
    synthesizer: {
      agent: 'synthesizer',
      analysis: 'Council consensus: Strong growth trajectory with enterprise upsell opportunity. Address Starter tier churn risk immediately to protect $8.2k MRR.',
      confidence: 0.87,
      recommendations: [
        'PRIORITY 1: Launch enterprise upsell (est. +$52k/mo)',
        'PRIORITY 2: Retention campaign for at-risk Starter customers',
        'PRIORITY 3: Automate support and onboarding processes'
      ]
    }
  };

  return mockResponses[agent] || {
    agent,
    analysis: `Analysis from ${agent}`,
    confidence: 0.75,
    recommendations: ['Mock recommendation']
  };
}

export async function analyzeWithCouncil(request: AnalysisRequest) {
  const { context, question, twinState, tenantId } = request;

  console.log(`Council analyzing: ${question}`);

  // Load council roles with personality configurations
  const councilRoles = loadCouncilRoles();

  if (councilRoles.length > 0) {
    console.log(`Using ${councilRoles.length} configured council roles with personalities`);

    // Filter out roles that don't have models assigned (optional)
    const activeRoles = councilRoles.filter(role => role.modelId);

    if (activeRoles.length > 0) {
      // Run all council members in parallel
      const agentResults = await Promise.all(
        activeRoles.map(role =>
          callAgent(role.id, question, { context, twinState }, role)
        )
      );

      // For synthesis, use a designated role or the first one
      const synthesisRole = activeRoles.find(r => r.id === 'ceo') || activeRoles[0];
      const synthesis = await callAgent('synthesizer', question, {
        context,
        twinState,
        agentOutputs: agentResults
      }, synthesisRole);

      return {
        question,
        tenant_id: tenantId,
        timestamp: new Date().toISOString(),
        agent_responses: agentResults,
        synthesis: synthesis,
        overall_confidence: 0.86,
        processing_time_ms: 1250,
        personality_enabled: true,
        roles_used: activeRoles.map(r => ({
          id: r.id,
          title: r.title,
          model: r.modelId,
          personality: r.personality
        }))
      };
    }
  }

  // Fallback to old behavior if no council roles configured
  console.log('No council roles configured, using default agents');
  const agentNames = ['analyst', 'strategist', 'operator', 'risk-officer', 'industry-expert'];

  const agentResults = await Promise.all(
    agentNames.map(agent => callAgent(agent, question, { context, twinState }))
  );

  // Synthesizer runs last, taking all agent outputs
  const synthesis = await callAgent('synthesizer', question, {
    context,
    twinState,
    agentOutputs: agentResults
  });

  return {
    question,
    tenant_id: tenantId,
    timestamp: new Date().toISOString(),
    agent_responses: agentResults,
    synthesis: synthesis,
    overall_confidence: 0.86,
    processing_time_ms: 1250,
    personality_enabled: false
  };
}
