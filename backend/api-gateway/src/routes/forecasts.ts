import { Router } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('ForecastRoutes');

const FORECASTING_URL = process.env.FORECASTING_SERVICE_URL || 'http://localhost:8001';

router.use(authenticate);

/**
 * GET /api/forecasts
 * Get all forecasts for a tenant
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;

    const response = await axios.get(`${FORECASTING_URL}/forecasts`, {
      headers: { 'X-Tenant-ID': tenantId },
      params: req.query,
    });

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching forecasts', { error: error.message });
    next(error);
  }
});

/**
 * GET /api/forecasts/:metric
 * Get forecast for a specific metric
 */
router.get('/:metric', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;
    const { metric } = req.params;

    const response = await axios.get(`${FORECASTING_URL}/forecasts/${metric}`, {
      headers: { 'X-Tenant-ID': tenantId },
      params: req.query,
    });

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching forecast', { metric: req.params.metric, error: error.message });
    next(error);
  }
});

/**
 * POST /api/forecasts/generate
 * Trigger forecast generation
 */
router.post('/generate', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;

    const response = await axios.post(
      `${FORECASTING_URL}/forecasts/generate`,
      req.body,
      {
        headers: { 'X-Tenant-ID': tenantId },
      }
    );

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error generating forecast', { error: error.message });
    next(error);
  }
});

export default router;
