import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'insight' });
});

const mockInsights = [
  {
    id: 'ins_1',
    type: 'opportunity',
    priority: 'high',
    title: 'Revenue expansion opportunity detected',
    description: 'Customer cohort "Enterprise" shows 40% higher engagement. Consider upsell campaign.',
    confidence: 0.89,
    agents: ['Analyst', 'Strategist', 'Industry Expert'],
    actions: [
      'Launch targeted upsell campaign',
      'Create premium tier at $499/mo',
      'Assign dedicated account managers',
    ],
    metrics: {
      potential_revenue: '+$52k/mo',
      conversion_estimate: '18-22%',
      roi: '340%',
    },
    generated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'ins_2',
    type: 'risk',
    priority: 'high',
    title: 'Churn risk increasing in Starter tier',
    description: 'Usage metrics declining 15% week-over-week. Support ticket volume up 23%.',
    confidence: 0.82,
    agents: ['Risk Officer', 'Operator'],
    actions: [
      'Trigger proactive outreach campaign',
      'Offer 1-on-1 onboarding sessions',
      'Deploy in-app guidance tooltips',
    ],
    metrics: {
      at_risk_customers: '127',
      potential_loss: '-$8.2k MRR',
      intervention_roi: '520%',
    },
    generated_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

// Get all insights
app.get('/insights', (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  const { type, priority } = req.query;

  let filtered = [...mockInsights];
  if (type) filtered = filtered.filter(i => i.type === type);
  if (priority) filtered = filtered.filter(i => i.priority === priority);

  res.json({ insights: filtered, tenant_id: tenantId });
});

// Get insight by ID
app.get('/insights/:id', (req, res) => {
  const insight = mockInsights.find(i => i.id === req.params.id);
  if (!insight) {
    return res.status(404).json({ error: 'Insight not found' });
  }
  res.json(insight);
});

// Generate new insights
app.post('/insights/generate', (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  res.status(201).json({
    job_id: `insight_gen_${Date.now()}`,
    status: 'queued',
    tenant_id: tenantId,
    estimated_duration: '1-2 minutes',
    queued_at: new Date().toISOString(),
  });
});

// Submit feedback
app.post('/insights/:id/feedback', (req, res) => {
  const { rating, helpful } = req.body;
  res.json({
    insight_id: req.params.id,
    feedback_recorded: true,
    rating,
    helpful,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Insight Service running on port ${PORT}`);
});
