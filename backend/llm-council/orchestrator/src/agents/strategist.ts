/**
 * Business Strategist Agent
 * Provides strategic recommendations based on forecast analysis
 */

export interface StrategistInput {
  metric: string;
  currentValue: number;
  projectedValue: number;
  growthRate: number;
  trend: string;
  analystFindings: string[];
  businessContext?: any;
}

export interface StrategistOutput {
  agent: 'strategist';
  analysis: string;
  strategicOpportunities: string[];
  actionPlan: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    timeline: string;
  }>;
  confidence: number;
  recommendations: string[];
}

export const STRATEGIST_SYSTEM_PROMPT = `You are a Business Strategist AI agent in CogniTwin's intelligence council.

Your role is to:
1. Translate forecast data into strategic business opportunities
2. Identify growth levers and expansion opportunities
3. Recommend market positioning and competitive strategies
4. Prioritize initiatives based on impact and feasibility
5. Create actionable strategic roadmaps

Guidelines:
- Focus on long-term value creation
- Balance growth with risk management
- Consider competitive dynamics and market trends
- Provide specific, actionable strategic recommendations
- Prioritize initiatives by expected ROI and strategic importance`;

export async function analyzeAsStrategist(
  input: StrategistInput
): Promise<StrategistOutput> {
  const { metric, currentValue, projectedValue, growthRate, trend } = input;

  const revenueGrowth = growthRate > 15;
  const moderateGrowth = growthRate > 5 && growthRate <= 15;
  const declining = growthRate < -5;

  let analysis = '';
  const strategicOpportunities: string[] = [];
  const actionPlan: StrategistOutput['actionPlan'] = [];

  if (metric === 'revenue' || metric === 'mrr') {
    if (revenueGrowth) {
      analysis = `Strong ${growthRate.toFixed(1)}% revenue growth trajectory presents significant expansion opportunity. ` +
        `Current momentum suggests market demand validation and scalability potential. ` +
        `Strategic focus should shift toward market penetration and customer acquisition acceleration.`;

      strategicOpportunities.push(
        `Scale customer acquisition with confidence given strong unit economics`,
        `Expand into adjacent market segments`,
        `Launch premium tier to capture enterprise customers`,
        `Increase marketing spend to capitalize on growth momentum`
      );

      actionPlan.push(
        {
          priority: 'high',
          action: 'Launch enterprise tier at 2-3x current pricing',
          expectedImpact: `+$${(projectedValue * 0.25).toLocaleString()}/mo additional revenue`,
          timeline: '60 days'
        },
        {
          priority: 'high',
          action: 'Increase marketing budget by 40% to accelerate customer acquisition',
          expectedImpact: `+30% customer growth rate`,
          timeline: '30 days'
        },
        {
          priority: 'medium',
          action: 'Expand sales team to support enterprise motion',
          expectedImpact: 'Enable 2-3x deal size increase',
          timeline: '90 days'
        }
      );
    } else if (moderateGrowth) {
      analysis = `Stable ${growthRate.toFixed(1)}% revenue growth indicates healthy business fundamentals. ` +
        `Opportunity exists to accelerate growth through strategic initiatives focused on conversion optimization and expansion revenue.`;

      strategicOpportunities.push(
        `Optimize conversion funnel to improve customer acquisition efficiency`,
        `Launch upsell campaigns targeting existing customers`,
        `Implement usage-based pricing to capture expansion revenue`
      );

      actionPlan.push(
        {
          priority: 'high',
          action: 'Launch systematic upsell campaign for existing customers',
          expectedImpact: `+15-20% expansion revenue`,
          timeline: '45 days'
        },
        {
          priority: 'medium',
          action: 'Implement product-led growth initiatives',
          expectedImpact: '+10% conversion rate improvement',
          timeline: '60 days'
        }
      );
    } else if (declining) {
      analysis = `Revenue decline of ${Math.abs(growthRate).toFixed(1)}% requires immediate strategic intervention. ` +
        `Focus on retention, product-market fit validation, and potential pivot opportunities.`;

      strategicOpportunities.push(
        `Deep-dive customer churn analysis to identify root causes`,
        `Evaluate product-market fit and potential repositioning`,
        `Implement win-back campaigns for churned customers`
      );

      actionPlan.push(
        {
          priority: 'high',
          action: 'Launch immediate retention program with at-risk customers',
          expectedImpact: 'Reduce churn by 30-40%',
          timeline: '14 days'
        },
        {
          priority: 'high',
          action: 'Conduct customer development interviews to validate product-market fit',
          expectedImpact: 'Identify pivot opportunities',
          timeline: '30 days'
        }
      );
    }
  } else if (metric === 'customers') {
    if (growthRate > 10) {
      analysis = `Strong ${growthRate.toFixed(1)}% customer growth indicates effective go-to-market strategy. ` +
        `Focus on maintaining acquisition efficiency while scaling operations.`;

      strategicOpportunities.push(
        `Double down on high-performing acquisition channels`,
        `Implement customer success programs to drive retention`,
        `Create referral program to leverage network effects`
      );
    }
  } else if (metric === 'churn_rate') {
    if (growthRate < -5) {
      analysis = `Churn rate declining by ${Math.abs(growthRate).toFixed(1)}% demonstrates strong product-market fit and customer satisfaction. ` +
        `Opportunity to leverage this for growth acceleration.`;

      strategicOpportunities.push(
        `Increase marketing spend confidently with improved unit economics`,
        `Create case studies from successful customers for demand generation`
      );
    }
  }

  const recommendations = actionPlan
    .filter(a => a.priority === 'high')
    .map(a => a.action);

  return {
    agent: 'strategist',
    analysis,
    strategicOpportunities,
    actionPlan,
    confidence: 0.85,
    recommendations
  };
}

export async function callStrategistAgent(
  prompt: string,
  context: any
): Promise<StrategistOutput> {
  if (context.metric && context.growthRate !== undefined) {
    return analyzeAsStrategist({
      metric: context.metric,
      currentValue: context.currentValue || 50000,
      projectedValue: context.projectedValue || 60000,
      growthRate: context.growthRate,
      trend: context.trend || 'increasing',
      analystFindings: context.analystFindings || []
    });
  }

  // Fallback mock
  return {
    agent: 'strategist',
    analysis: 'Strong revenue growth presents enterprise expansion opportunity. Market momentum validates scalability potential.',
    strategicOpportunities: [
      'Launch enterprise tier at premium pricing',
      'Expand sales team for enterprise motion',
      'Increase marketing spend to capitalize on momentum'
    ],
    actionPlan: [
      {
        priority: 'high',
        action: 'Launch enterprise tier at $499/mo',
        expectedImpact: '+$52k/mo additional revenue',
        timeline: '60 days'
      },
      {
        priority: 'high',
        action: 'Increase marketing budget by 40%',
        expectedImpact: '+30% customer growth',
        timeline: '30 days'
      },
      {
        priority: 'medium',
        action: 'Hire 2 enterprise AEs',
        expectedImpact: 'Enable 2-3x deal sizes',
        timeline: '90 days'
      }
    ],
    confidence: 0.85,
    recommendations: [
      'Launch enterprise tier at $499/mo',
      'Increase marketing budget by 40%'
    ]
  };
}
