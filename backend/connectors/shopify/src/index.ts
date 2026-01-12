import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    connector: 'shopify',
    version: '1.0.0'
  });
});

/**
 * POST /connect
 * Initiate Shopify OAuth connection
 */
app.post('/connect', async (req, res) => {
  const { shop_domain, tenant_id } = req.body;

  // Mock OAuth flow
  res.json({
    authorization_url: `https://${shop_domain}/admin/oauth/authorize`,
    state: `tenant_${tenant_id}_${Date.now()}`,
    redirect_uri: process.env.SHOPIFY_REDIRECT_URI
  });
});

/**
 * POST /sync
 * Trigger data synchronization from Shopify
 */
app.post('/sync', async (req, res) => {
  const { tenant_id, data_types } = req.body;

  console.log(`Syncing Shopify data for tenant: ${tenant_id}`);

  // Mock sync job
  res.json({
    job_id: `shopify_sync_${Date.now()}`,
    tenant_id,
    data_types: data_types || ['orders', 'customers', 'products'],
    status: 'queued',
    estimated_duration: '2-5 minutes',
    queued_at: new Date().toISOString()
  });
});

/**
 * GET /data/orders
 * Get orders from Shopify
 */
app.get('/data/orders', async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];

  // Mock Shopify orders
  const orders = [
    {
      id: 'order_1',
      order_number: '1001',
      customer: { email: 'customer@example.com', name: 'John Doe' },
      total_price: 127.50,
      currency: 'USD',
      line_items: [
        { product_id: 'prod_1', title: 'Premium Widget', quantity: 2, price: 63.75 }
      ],
      created_at: new Date(Date.now() - 86400000).toISOString(),
      financial_status: 'paid',
      fulfillment_status: 'fulfilled'
    }
  ];

  res.json({
    orders,
    count: orders.length,
    tenant_id: tenantId
  });
});

/**
 * GET /data/customers
 * Get customers from Shopify
 */
app.get('/data/customers', async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];

  const customers = [
    {
      id: 'cust_1',
      email: 'customer@example.com',
      first_name: 'John',
      last_name: 'Doe',
      orders_count: 5,
      total_spent: '637.50',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      tags: ['vip', 'enterprise']
    }
  ];

  res.json({
    customers,
    count: customers.length,
    tenant_id: tenantId
  });
});

/**
 * POST /webhooks/orders/create
 * Shopify webhook for new orders
 */
app.post('/webhooks/orders/create', async (req, res) => {
  console.log('Received Shopify order webhook:', req.body);

  // Process webhook and update twin
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Shopify Connector running on port ${PORT}`);
});

export default app;
