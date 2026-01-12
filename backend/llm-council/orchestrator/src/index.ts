import express from 'express';
import dotenv from 'dotenv';
import { analyzeWithCouncil, getAgentPrompts } from './council';
import { analyzeForecastWithCouncil, analyzeMultipleForecastsWithCouncil } from './forecast-council';
import { simulateDecision, PRESET_COUNCILS, SimulationScenario } from './simulation-engine';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'llm-council-orchestrator',
    agents: ['analyst', 'strategist', 'operator', 'risk-officer', 'industry-expert', 'synthesizer']
  });
});

/**
 * POST /council/analyze
 * Run multi-agent analysis on business data
 */
app.post('/council/analyze', async (req, res) => {
  try {
    const { context, question, twinState } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    console.log(`Running council analysis for tenant: ${tenantId}`);

    const result = await analyzeWithCouncil({
      context,
      question,
      twinState,
      tenantId
    });

    res.json(result);
  } catch (error: any) {
    console.error('Council analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /council/agents
 * Get information about available agents
 */
app.get('/council/agents', (req, res) => {
  const agents = [
    {
      id: 'analyst',
      name: 'Data Analyst',
      role: 'Analyzes metrics, trends, and patterns in business data',
      expertise: ['metrics', 'trends', 'patterns', 'correlations']
    },
    {
      id: 'strategist',
      name: 'Business Strategist',
      role: 'Provides strategic recommendations and growth opportunities',
      expertise: ['growth', 'strategy', 'market-fit', 'positioning']
    },
    {
      id: 'operator',
      name: 'Operations Expert',
      role: 'Focuses on operational efficiency and process optimization',
      expertise: ['efficiency', 'processes', 'automation', 'workflows']
    },
    {
      id: 'risk-officer',
      name: 'Risk Officer',
      role: 'Identifies risks, threats, and mitigation strategies',
      expertise: ['risk-assessment', 'threats', 'mitigation', 'compliance']
    },
    {
      id: 'industry-expert',
      name: 'Industry Expert',
      role: 'Provides industry-specific insights and best practices',
      expertise: ['industry-trends', 'best-practices', 'benchmarks']
    },
    {
      id: 'synthesizer',
      name: 'Insight Synthesizer',
      role: 'Synthesizes all agent inputs into actionable insights',
      expertise: ['synthesis', 'prioritization', 'actionability']
    }
  ];

  res.json({ agents });
});

/**
 * POST /council/forecast/analyze
 * Analyze a single forecast using the LLM Council
 */
app.post('/council/forecast/analyze', async (req, res) => {
  try {
    const { metric, horizonDays, useEnsemble } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return res.status(400).json({ error: 'X-Tenant-ID header required' });
    }

    if (!metric) {
      return res.status(400).json({ error: 'metric is required in request body' });
    }

    console.log(`[ForecastCouncil] Analyzing ${metric} forecast for tenant ${tenantId}`);

    const result = await analyzeForecastWithCouncil({
      tenantId,
      metric,
      horizonDays: horizonDays || 30,
      useEnsemble: useEnsemble !== false
    });

    res.json(result);
  } catch (error: any) {
    console.error('Forecast council analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /council/forecast/analyze-multiple
 * Analyze multiple forecasts and provide cross-metric insights
 */
app.post('/council/forecast/analyze-multiple', async (req, res) => {
  try {
    const { metrics } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return res.status(400).json({ error: 'X-Tenant-ID header required' });
    }

    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return res.status(400).json({ error: 'metrics array is required in request body' });
    }

    console.log(`[ForecastCouncil] Analyzing ${metrics.length} forecasts for tenant ${tenantId}`);

    const result = await analyzeMultipleForecastsWithCouncil(tenantId, metrics);

    res.json(result);
  } catch (error: any) {
    console.error('Multi-forecast council analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /council/forecast/{metric}
 * Quick forecast analysis for a single metric
 */
app.get('/council/forecast/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string;
    const horizonDays = parseInt(req.query.days as string) || 30;
    const useEnsemble = req.query.ensemble !== 'false';

    if (!tenantId) {
      return res.status(400).json({ error: 'X-Tenant-ID header required' });
    }

    console.log(`[ForecastCouncil] GET forecast analysis for ${metric}`);

    const result = await analyzeForecastWithCouncil({
      tenantId,
      metric,
      horizonDays,
      useEnsemble
    });

    res.json(result);
  } catch (error: any) {
    console.error('Forecast analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /council/simulate
 * Simulate a decision using configured agent council
 */
app.post('/council/simulate', async (req, res) => {
  try {
    const scenario: SimulationScenario = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return res.status(400).json({ error: 'X-Tenant-ID header required' });
    }

    if (!scenario.name || !scenario.metric) {
      return res.status(400).json({ error: 'Scenario name and metric are required' });
    }

    console.log(`[Simulation] Running scenario "${scenario.name}" for tenant ${tenantId}`);

    const includeDebate = req.query.debate === 'true';
    const result = await simulateDecision(tenantId, scenario, { includeDebate });

    res.json(result);
  } catch (error: any) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /council/presets
 * Get preset council configurations
 */
app.get('/council/presets', (req, res) => {
  res.json({
    presets: Object.keys(PRESET_COUNCILS).map(key => ({
      id: key,
      ...PRESET_COUNCILS[key as keyof typeof PRESET_COUNCILS]
    }))
  });
});

/**
 * POST /council/simulate/preset
 * Run simulation with a preset council configuration
 */
app.post('/council/simulate/preset', async (req, res) => {
  try {
    const { presetId, scenarioName, metric, assumptions } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return res.status(400).json({ error: 'X-Tenant-ID header required' });
    }

    const preset = PRESET_COUNCILS[presetId as keyof typeof PRESET_COUNCILS];
    if (!preset) {
      return res.status(400).json({
        error: `Invalid preset ID. Available: ${Object.keys(PRESET_COUNCILS).join(', ')}`
      });
    }

    const scenario: SimulationScenario = {
      name: scenarioName || `Scenario using ${preset.name}`,
      description: `Simulation with ${preset.name} council configuration`,
      metric: metric || 'revenue',
      assumptions: assumptions || { price_increase: 0.10 },
      agentConfigs: preset.agentConfigs,
      decisionFramework: preset.decisionFramework
    };

    console.log(`[Simulation] Running preset "${presetId}" for tenant ${tenantId}`);

    const includeDebate = req.query.debate === 'true';
    const result = await simulateDecision(tenantId, scenario, { includeDebate });

    res.json(result);
  } catch (error: any) {
    console.error('Preset simulation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /council/simulate/compare
 * Compare multiple council configurations on the same scenario
 */
app.post('/council/simulate/compare', async (req, res) => {
  try {
    const { scenarioBase, presetIds } = req.body;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return res.status(400).json({ error: 'X-Tenant-ID header required' });
    }

    if (!presetIds || !Array.isArray(presetIds)) {
      return res.status(400).json({ error: 'presetIds array is required' });
    }

    console.log(`[Simulation] Comparing ${presetIds.length} council configurations`);

    const results = await Promise.all(
      presetIds.map(async (presetId: string) => {
        const preset = PRESET_COUNCILS[presetId as keyof typeof PRESET_COUNCILS];
        if (!preset) return null;

        const scenario: SimulationScenario = {
          name: `${scenarioBase?.name || 'Scenario'} - ${preset.name}`,
          description: scenarioBase?.description || 'Comparison scenario',
          metric: scenarioBase?.metric || 'revenue',
          assumptions: scenarioBase?.assumptions || { price_increase: 0.10 },
          agentConfigs: preset.agentConfigs,
          decisionFramework: preset.decisionFramework
        };

        const includeDebate = req.query.debate === 'true';
        return {
          presetId,
          presetName: preset.name,
          result: await simulateDecision(tenantId, scenario, { includeDebate })
        };
      })
    );

    const validResults = results.filter(r => r !== null);

    // Compare outcomes
    const comparison = {
      scenarios: validResults,
      summary: {
        approved: validResults.filter(r => r!.result.finalDecision.outcome === 'approved').length,
        rejected: validResults.filter(r => r!.result.finalDecision.outcome === 'rejected').length,
        needsModification: validResults.filter(r => r!.result.finalDecision.outcome === 'needs-modification').length
      },
      recommendations: validResults.map(r => ({
        council: r!.presetName,
        outcome: r!.result.finalDecision.outcome,
        reasoning: r!.result.finalDecision.reasoning,
        confidence: r!.result.finalDecision.confidence
      }))
    };

    res.json(comparison);
  } catch (error: any) {
    console.error('Compare simulation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`LLM Council Orchestrator running on port ${PORT}`);
  console.log(`Forecast Council endpoints available at /council/forecast/*`);
  console.log(`Simulation endpoints available at /council/simulate/*`);
});

export default app;
