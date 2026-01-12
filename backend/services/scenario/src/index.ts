import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'scenario' });
});

// Get all scenarios
app.get('/scenarios', (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  res.json({
    scenarios: [
      {
        id: 'sc_1',
        name: 'Price increase 10%',
        status: 'completed',
        parameters: { price_change: 0.10 },
        results: {
          revenue: { value: '+$5,200/mo', percent: '+8.7%' },
          churn: { value: '+1.2%', percent: '+15%' },
        },
        confidence: 0.87,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    tenant_id: tenantId,
  });
});

// Get scenario by ID
app.get('/scenarios/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: 'Price increase 10%',
    status: 'completed',
    parameters: { price_change: 0.10 },
    results: {
      revenue: { value: '+$5,200/mo', percent: '+8.7%' },
      churn: { value: '+1.2%', percent: '+15%' },
    },
    confidence: 0.87,
  });
});

// Create new scenario
app.post('/scenarios', (req, res) => {
  const { name, parameters } = req.body;
  res.status(201).json({
    id: `sc_${Date.now()}`,
    name,
    parameters,
    status: 'running',
    queued_at: new Date().toISOString(),
  });
});

// Delete scenario
app.delete('/scenarios/:id', (req, res) => {
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Scenario Service running on port ${PORT}`);
});
