import { Router } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('TwinRoutes');

const BUSINESS_TWIN_URL = process.env.BUSINESS_TWIN_SERVICE_URL || 'http://localhost:3001';

// All twin routes require authentication
router.use(authenticate);

/**
 * GET /api/twin/state
 * Get current digital twin state
 */
router.get('/state', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;

    const response = await axios.get(`${BUSINESS_TWIN_URL}/twin/state`, {
      headers: { 'X-Tenant-ID': tenantId },
    });

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching twin state', { error: error.message });
    next(error);
  }
});

/**
 * GET /api/twin/metrics
 * Get twin metrics
 */
router.get('/metrics', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;

    const response = await axios.get(`${BUSINESS_TWIN_URL}/twin/metrics`, {
      headers: { 'X-Tenant-ID': tenantId },
      params: req.query,
    });

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching twin metrics', { error: error.message });
    next(error);
  }
});

/**
 * POST /api/twin/sync
 * Trigger twin synchronization
 */
router.post('/sync', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;

    const response = await axios.post(
      `${BUSINESS_TWIN_URL}/twin/sync`,
      req.body,
      {
        headers: { 'X-Tenant-ID': tenantId },
      }
    );

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error triggering twin sync', { error: error.message });
    next(error);
  }
});

export default router;
