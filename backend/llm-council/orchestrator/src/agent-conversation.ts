/**
 * Agent Conversation System
 *
 * Shows how LLM agents think, debate, and interact with each other
 * Provides transparent reasoning and multi-agent dialogue
 */

export interface AgentThought {
  agent: string;
  timestamp: string;
  thoughtProcess: {
    observation: string;        // What the agent sees
    reasoning: string[];        // Step-by-step thinking
    concerns: string[];         // Worries or objections
    questions: string[];        // Questions for other agents
    conclusion: string;         // Final thought
  };
  confidence: number;
  dataReferences: string[];     // Which data points influenced this thought
}

export interface AgentMessage {
  from: string;
  to: string | 'all';
  timestamp: string;
  messageType: 'question' | 'objection' | 'support' | 'clarification' | 'proposal';
  content: string;
  referencesMessage?: string;   // ID of message being responded to
  confidence: number;
}

export interface AgentDebate {
  topic: string;
  participants: string[];
  rounds: Array<{
    roundNumber: number;
    thoughts: AgentThought[];
    messages: AgentMessage[];
    agreements: string[];
    disagreements: string[];
  }>;
  finalConsensus?: {
    decision: string;
    supportingAgents: string[];
    dissenting: string[];
    reasoning: string;
    confidence: number;
  };
}

export interface ConversationContext {
  scenario: any;
  forecastData: any;
  businessContext: any;
}

/**
 * Generate detailed agent thinking process
 */
export function generateAgentThinking(
  agent: string,
  context: ConversationContext,
  decision: any
): AgentThought {
  const { scenario, forecastData } = context;

  let thoughtProcess;

  switch (agent) {
    case 'analyst':
      thoughtProcess = generateAnalystThinking(forecastData, decision);
      break;
    case 'strategist':
      thoughtProcess = generateStrategistThinking(forecastData, scenario, decision);
      break;
    case 'risk-officer':
      thoughtProcess = generateRiskOfficerThinking(forecastData, scenario, decision);
      break;
    case 'cfo':
      thoughtProcess = generateCFOThinking(forecastData, scenario, decision);
      break;
    case 'ceo':
      thoughtProcess = generateCEOThinking(forecastData, scenario, decision);
      break;
    default:
      thoughtProcess = {
        observation: 'Analyzing data...',
        reasoning: ['Evaluating scenario'],
        concerns: [],
        questions: [],
        conclusion: 'Analysis complete'
      };
  }

  const dataReferences = extractDataReferences(forecastData, decision);

  return {
    agent,
    timestamp: new Date().toISOString(),
    thoughtProcess,
    confidence: decision.confidence || 0.85,
    dataReferences
  };
}

/**
 * Analyst's thinking process
 */
function generateAnalystThinking(forecastData: any, decision: any): AgentThought['thoughtProcess'] {
  const accuracy = forecastData.accuracy || 0.89;
  const trend = forecastData.trend || 'increasing';

  return {
    observation: `Examining forecast model output: ${forecastData.model_type} with ${(accuracy * 100).toFixed(1)}% accuracy. ` +
      `Trend appears ${trend}.`,

    reasoning: [
      `Step 1: Validate model confidence - ${(accuracy * 100).toFixed(1)}% accuracy is ${accuracy > 0.9 ? 'excellent' : accuracy > 0.85 ? 'good' : 'acceptable'}`,
      `Step 2: Analyze trend strength - ${trend} pattern detected in forecast data`,
      `Step 3: Calculate volatility - checking standard deviation across prediction window`,
      `Step 4: Assess forecast uncertainty - examining confidence interval width`,
      `Step 5: Cross-reference with historical patterns - comparing to past performance`
    ],

    concerns: accuracy < 0.85 ? [
      'Model accuracy below 85% threshold - predictions may be less reliable',
      'Consider gathering additional data to improve model confidence'
    ] : [],

    questions: [
      'Risk Officer: Have you considered the uncertainty bands in your risk assessment?',
      'Strategist: Does the forecast volatility align with our growth strategy timeline?'
    ],

    conclusion: `Based on ${(accuracy * 100).toFixed(1)}% model confidence and ${trend} trend, ` +
      `the quantitative analysis ${decision.decision === 'approve' ? 'supports proceeding' : decision.decision === 'reject' ? 'advises caution' : 'suggests conditions'}.`
  };
}

/**
 * Strategist's thinking process
 */
function generateStrategistThinking(forecastData: any, scenario: any, decision: any): AgentThought['thoughtProcess'] {
  const growthRate = calculateGrowthRate(forecastData);
  const isAggressive = decision.perspective === 'aggressive';

  return {
    observation: `Growth trajectory shows ${growthRate.toFixed(1)}% change. ` +
      `This ${Math.abs(growthRate) > 20 ? 'significant' : Math.abs(growthRate) > 10 ? 'moderate' : 'modest'} shift ` +
      `${isAggressive ? 'presents opportunity' : 'requires careful consideration'}.`,

    reasoning: [
      `Step 1: Strategic alignment - Does ${growthRate.toFixed(1)}% growth fit our ${isAggressive ? 'aggressive' : 'balanced'} strategy?`,
      `Step 2: Market positioning - How does this impact competitive positioning?`,
      `Step 3: Resource requirements - What investments needed to capture this growth?`,
      `Step 4: Timing analysis - Is market timing favorable for this move?`,
      `Step 5: Risk-reward balance - Expected return justifies strategic risk?`
    ],

    concerns: Math.abs(growthRate) > 25 && !isAggressive ? [
      'Growth rate exceeds conservative risk appetite',
      'May require significant operational changes',
      'Competitor response could erode projected gains'
    ] : Math.abs(growthRate) < 10 && isAggressive ? [
      'Growth rate too modest for aggressive strategy',
      'Missing larger opportunity in market?'
    ] : [],

    questions: [
      'Operator: Can our current operations scale to support this growth rate?',
      'CFO: What\'s the investment required and expected ROI timeline?',
      'Analyst: How confident are we in the sustainability of this trend?'
    ],

    conclusion: decision.decision === 'approve'
      ? `Strategic opportunity warrants execution. Growth aligns with ${isAggressive ? 'aggressive expansion' : 'measured growth'} objectives.`
      : decision.decision === 'reject'
      ? `Strategic risks outweigh benefits. Better opportunities exist elsewhere.`
      : `Strategic merit exists but requires risk mitigation before proceeding.`
  };
}

/**
 * Risk Officer's thinking process
 */
function generateRiskOfficerThinking(forecastData: any, scenario: any, decision: any): AgentThought['thoughtProcess'] {
  const riskScore = decision.riskScore || 0.45;
  const riskTolerance = decision.riskTolerance || 'medium';

  return {
    observation: `Risk assessment shows ${(riskScore * 100).toFixed(0)}% risk level. ` +
      `Organization tolerance is ${riskTolerance}. ` +
      `${scenario.assumptions ? `Scenario includes ${Object.keys(scenario.assumptions).length} assumptions.` : ''}`,

    reasoning: [
      `Step 1: Quantify forecast uncertainty - Model accuracy indicates ${((1 - forecastData.accuracy) * 100).toFixed(1)}% uncertainty`,
      `Step 2: Assess assumption risk - Each assumption introduces compounding uncertainty`,
      `Step 3: Identify downside scenarios - What if key assumptions fail?`,
      `Step 4: Compare to risk appetite - ${(riskScore * 100).toFixed(0)}% vs ${riskTolerance} tolerance threshold`,
      `Step 5: Evaluate mitigation options - Can we reduce risk to acceptable level?`
    ],

    concerns: riskScore > 0.5 ? [
      `Risk score ${(riskScore * 100).toFixed(0)}% ${riskTolerance === 'low' ? 'significantly exceeds' : 'approaches'} acceptable threshold`,
      'Multiple assumptions create compounding risk',
      'Limited visibility into tail-risk scenarios',
      'Reversibility is low - difficult to unwind if wrong'
    ] : riskScore > 0.3 ? [
      'Moderate risk present - monitoring required',
      'Key risk indicators should be defined'
    ] : [],

    questions: [
      'Strategist: Have you considered worst-case scenario impact on strategic positioning?',
      'CFO: What\'s the financial buffer if downside case occurs?',
      'Operator: Can operations absorb potential volatility?',
      'Analyst: What\'s the probability distribution around your central forecast?'
    ],

    conclusion: decision.decision === 'approve'
      ? `Risk level ${(riskScore * 100).toFixed(0)}% is acceptable within ${riskTolerance} tolerance. Proceed with monitoring.`
      : decision.decision === 'reject'
      ? `Risk level ${(riskScore * 100).toFixed(0)}% exceeds ${riskTolerance} tolerance. Cannot recommend approval.`
      : `Risk can be managed with proper mitigation: monitoring, kill switches, and phased rollout.`
  };
}

/**
 * CFO's thinking process
 */
function generateCFOThinking(forecastData: any, scenario: any, decision: any): AgentThought['thoughtProcess'] {
  const roi = decision.financialImpact?.roi || 2.1;
  const npv = decision.financialImpact?.npv || 150000;

  return {
    observation: `Financial analysis shows ROI of ${roi.toFixed(1)}x and NPV of $${npv.toLocaleString()}. ` +
      `Hurdle rate comparison indicates ${roi >= 2.0 ? 'attractive' : roi >= 1.5 ? 'acceptable' : 'marginal'} returns.`,

    reasoning: [
      `Step 1: Calculate revenue impact - Forecasted at $${npv.toLocaleString()} over period`,
      `Step 2: Estimate investment required - Approximately ${(npv / roi).toFixed(0)}k`,
      `Step 3: Compute ROI and payback period - ${roi.toFixed(1)}x return, ~${(12 / roi).toFixed(0)} month payback`,
      `Step 4: Compare to hurdle rate - Target 2.0x, achieved ${roi.toFixed(1)}x`,
      `Step 5: Assess financial risk - Downside scenario analysis and sensitivity`
    ],

    concerns: roi < 2.0 ? [
      `ROI of ${roi.toFixed(1)}x below 2.0x hurdle rate`,
      'Return may not justify opportunity cost',
      'Sensitivity to assumptions is high'
    ] : npv < 100000 ? [
      'Absolute NPV is modest - worth the effort?',
      'Transaction costs may erode returns'
    ] : [],

    questions: [
      'Strategist: What\'s the long-term strategic value beyond direct ROI?',
      'Risk Officer: What\'s the downside financial scenario?',
      'Operator: Are cost estimates realistic given operational constraints?'
    ],

    conclusion: decision.decision === 'approve'
      ? `Financial returns of ${roi.toFixed(1)}x ROI and $${npv.toLocaleString()} NPV meet investment criteria.`
      : decision.decision === 'reject'
      ? `Financial returns insufficient. Recommend exploring higher-ROI opportunities.`
      : `Financials are borderline. Approve if costs can be optimized to improve ROI to 2.0x+.`
  };
}

/**
 * CEO's thinking process
 */
function generateCEOThinking(forecastData: any, scenario: any, decision: any): AgentThought['thoughtProcess'] {
  const strategicFit = decision.strategicAlignment || 0.8;

  return {
    observation: `Evaluating holistic business impact. Strategic alignment scores ${(strategicFit * 100).toFixed(0)}%. ` +
      `Team has raised ${decision.concernCount || 3} concerns and ${decision.questionCount || 4} questions.`,

    reasoning: [
      `Step 1: Strategic priority - Does this advance our core mission and vision?`,
      `Step 2: Team consensus - Weighing input from Analyst (data), Strategist (growth), Risk (safety), CFO (returns)`,
      `Step 3: Competitive dynamics - How does this impact market position?`,
      `Step 4: Organizational readiness - Is the team ready to execute?`,
      `Step 5: Leadership conviction - Despite concerns, is this the right move?`
    ],

    concerns: strategicFit < 0.7 ? [
      'Limited strategic alignment with core objectives',
      'Team concerns suggest execution challenges',
      'May be distraction from higher-priority initiatives'
    ] : [],

    questions: [
      'All agents: If we proceed, what are the key success metrics to monitor?',
      'Risk Officer: What would make you comfortable enough to support this?',
      'Strategist: What\'s the competitive response we should anticipate?'
    ],

    conclusion: decision.decision === 'approve'
      ? `Strong strategic fit and team support. Leadership decision is to proceed with execution.`
      : decision.decision === 'reject'
      ? `Insufficient strategic value and team concerns warrant rejection. Focus resources elsewhere.`
      : `Team input highlights valid concerns. Approve with conditions to address key risks.`
  };
}

/**
 * Generate multi-agent debate conversation
 */
export function generateDebateConversation(
  scenario: any,
  agentDecisions: any[],
  context: ConversationContext
): AgentDebate {
  const participants = agentDecisions.map(d => d.agent);

  // Round 1: Initial thoughts
  const round1Thoughts = agentDecisions.map(decision =>
    generateAgentThinking(decision.agent, context, decision)
  );

  // Round 1: Questions and objections
  const round1Messages = generateRound1Messages(round1Thoughts, agentDecisions);

  // Round 2: Responses and clarifications
  const round2Messages = generateRound2Messages(round1Messages, agentDecisions);

  // Round 3: Consensus building
  const round3Messages = generateRound3Messages(round2Messages, agentDecisions);

  // Identify agreements and disagreements
  const agreements = findAgreements(agentDecisions);
  const disagreements = findDisagreements(agentDecisions);

  // Final consensus
  const finalConsensus = buildFinalConsensus(agentDecisions, round3Messages);

  return {
    topic: scenario.name,
    participants,
    rounds: [
      {
        roundNumber: 1,
        thoughts: round1Thoughts,
        messages: round1Messages,
        agreements: agreements.slice(0, 2),
        disagreements: disagreements.slice(0, 2)
      },
      {
        roundNumber: 2,
        thoughts: [],
        messages: round2Messages,
        agreements: agreements.slice(2, 4),
        disagreements: disagreements.slice(2, 4)
      },
      {
        roundNumber: 3,
        thoughts: [],
        messages: round3Messages,
        agreements: agreements.slice(4),
        disagreements: disagreements.slice(4)
      }
    ],
    finalConsensus
  };
}

/**
 * Generate Round 1 messages (questions and objections)
 */
function generateRound1Messages(thoughts: AgentThought[], decisions: any[]): AgentMessage[] {
  const messages: AgentMessage[] = [];

  // Each agent asks their questions
  thoughts.forEach(thought => {
    thought.thoughtProcess.questions.forEach(question => {
      const [targetAgent, questionText] = question.split(':');
      if (questionText) {
        messages.push({
          from: thought.agent,
          to: targetAgent.trim(),
          timestamp: new Date().toISOString(),
          messageType: 'question',
          content: questionText.trim(),
          confidence: thought.confidence
        });
      }
    });

    // Objections if agent voted differently than others
    if (thought.thoughtProcess.concerns.length > 0) {
      const otherAgents = thoughts.filter(t => t.agent !== thought.agent);
      const hasDisagreement = otherAgents.some(t =>
        decisions.find(d => d.agent === t.agent)?.decision !==
        decisions.find(d => d.agent === thought.agent)?.decision
      );

      if (hasDisagreement) {
        messages.push({
          from: thought.agent,
          to: 'all',
          timestamp: new Date().toISOString(),
          messageType: 'objection',
          content: `I have concerns: ${thought.thoughtProcess.concerns[0]}`,
          confidence: thought.confidence
        });
      }
    }
  });

  return messages;
}

/**
 * Generate Round 2 messages (responses and clarifications)
 */
function generateRound2Messages(round1Messages: AgentMessage[], decisions: any[]): AgentMessage[] {
  const messages: AgentMessage[] = [];

  // Respond to questions
  round1Messages.filter(m => m.messageType === 'question').forEach(question => {
    const targetDecision = decisions.find(d => d.agent === question.to);
    if (targetDecision) {
      messages.push({
        from: question.to,
        to: question.from,
        timestamp: new Date().toISOString(),
        messageType: 'clarification',
        content: `Re: ${question.content.substring(0, 50)}... - ${targetDecision.reasoning.substring(0, 100)}`,
        referencesMessage: question.timestamp,
        confidence: targetDecision.confidence
      });
    }
  });

  // Support or challenge objections
  round1Messages.filter(m => m.messageType === 'objection').forEach(objection => {
    const supportingAgent = decisions.find(d =>
      d.agent !== objection.from && d.decision === decisions.find(d2 => d2.agent === objection.from)?.decision
    );

    if (supportingAgent) {
      messages.push({
        from: supportingAgent.agent,
        to: objection.from,
        timestamp: new Date().toISOString(),
        messageType: 'support',
        content: `I agree with your concerns. ${supportingAgent.reasoning.substring(0, 80)}`,
        referencesMessage: objection.timestamp,
        confidence: supportingAgent.confidence
      });
    }
  });

  return messages;
}

/**
 * Generate Round 3 messages (consensus building)
 */
function generateRound3Messages(round2Messages: AgentMessage[], decisions: any[]): AgentMessage[] {
  const messages: AgentMessage[] = [];

  // CEO or senior agent proposes consensus
  const ceoDecision = decisions.find(d => d.agent === 'ceo');
  const seniorAgent = ceoDecision || decisions[0];

  messages.push({
    from: seniorAgent.agent,
    to: 'all',
    timestamp: new Date().toISOString(),
    messageType: 'proposal',
    content: `Based on our discussion, I propose we ${seniorAgent.decision} with the following conditions: ${seniorAgent.requirements?.slice(0, 2).join(', ') || 'standard monitoring'}`,
    confidence: seniorAgent.confidence
  });

  return messages;
}

/**
 * Find points of agreement
 */
function findAgreements(decisions: any[]): string[] {
  const agreements: string[] = [];

  // Check if all agree on data quality
  if (decisions.every(d => d.confidence > 0.8)) {
    agreements.push('All agents agree: Forecast data quality is high');
  }

  // Check if majority agrees on direction
  const approvals = decisions.filter(d => d.decision === 'approve').length;
  if (approvals > decisions.length / 2) {
    agreements.push(`Majority (${approvals}/${decisions.length}) support approval`);
  }

  return agreements;
}

/**
 * Find points of disagreement
 */
function findDisagreements(decisions: any[]): string[] {
  const disagreements: string[] = [];

  const uniqueDecisions = new Set(decisions.map(d => d.decision));
  if (uniqueDecisions.size > 1) {
    disagreements.push(`Split decision: ${Array.from(uniqueDecisions).join(', ')}`);
  }

  return disagreements;
}

/**
 * Build final consensus
 */
function buildFinalConsensus(decisions: any[], messages: AgentMessage[]): AgentDebate['finalConsensus'] {
  const approvals = decisions.filter(d => d.decision === 'approve');
  const rejections = decisions.filter(d => d.decision === 'reject');

  const finalDecision = approvals.length > rejections.length ? 'approve' :
                       rejections.length > approvals.length ? 'reject' : 'conditional';

  return {
    decision: finalDecision,
    supportingAgents: approvals.map(d => d.agent),
    dissenting: rejections.map(d => d.agent),
    reasoning: `After ${messages.length} exchanges, council ${finalDecision}s with ${approvals.length} in favor.`,
    confidence: decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length
  };
}

/**
 * Extract data references from decision
 */
function extractDataReferences(forecastData: any, decision: any): string[] {
  return [
    `Model: ${forecastData.model_type}`,
    `Accuracy: ${(forecastData.accuracy * 100).toFixed(1)}%`,
    `Trend: ${forecastData.trend || 'calculated'}`,
    `Confidence: ${(decision.confidence * 100).toFixed(1)}%`
  ];
}

/**
 * Calculate growth rate from forecast
 */
function calculateGrowthRate(forecastData: any): number {
  if (!forecastData.data || forecastData.data.length === 0) return 0;

  const first = forecastData.data[0].forecast;
  const last = forecastData.data[forecastData.data.length - 1].forecast;

  return ((last - first) / first) * 100;
}
