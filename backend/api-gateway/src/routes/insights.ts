import { Router } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('InsightRoutes');

const INSIGHT_URL = process.env.INSIGHT_SERVICE_URL || 'http://localhost:3003';

router.use(authenticate);

/**
 * GET /api/insights
 * Get all insights
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;

    const response = await axios.get(`${INSIGHT_URL}/insights`, {
      headers: { 'X-Tenant-ID': tenantId },
      params: req.query,
    });

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching insights', { error: error.message });
    next(error);
  }
});

/**
 * GET /api/insights/:id
 * Get specific insight
 */
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;

    const response = await axios.get(`${INSIGHT_URL}/insights/${id}`, {
      headers: { 'X-Tenant-ID': tenantId },
    });

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching insight', { insightId: req.params.id, error: error.message });
    next(error);
  }
});

/**
 * POST /api/insights/generate
 * Generate new insights using AI Council
 */
router.post('/generate', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;

    const response = await axios.post(
      `${INSIGHT_URL}/insights/generate`,
      req.body,
      {
        headers: { 'X-Tenant-ID': tenantId },
      }
    );

    res.status(201).json(response.data);
  } catch (error: any) {
    logger.error('Error generating insights', { error: error.message });
    next(error);
  }
});

/**
 * POST /api/insights/:id/feedback
 * Submit feedback on an insight
 */
router.post('/:id/feedback', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;

    const response = await axios.post(
      `${INSIGHT_URL}/insights/${id}/feedback`,
      req.body,
      {
        headers: { 'X-Tenant-ID': tenantId },
      }
    );

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error submitting feedback', { insightId: req.params.id, error: error.message });
    next(error);
  }
});

export default router;
