import { Router } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('ScenarioRoutes');

const SCENARIO_URL = process.env.SCENARIO_SERVICE_URL || 'http://localhost:3002';

router.use(authenticate);

/**
 * GET /api/scenarios
 * Get all scenarios
 */
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;

    const response = await axios.get(`${SCENARIO_URL}/scenarios`, {
      headers: { 'X-Tenant-ID': tenantId },
      params: req.query,
    });

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching scenarios', { error: error.message });
    next(error);
  }
});

/**
 * GET /api/scenarios/:id
 * Get specific scenario
 */
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;

    const response = await axios.get(`${SCENARIO_URL}/scenarios/${id}`, {
      headers: { 'X-Tenant-ID': tenantId },
    });

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching scenario', { scenarioId: req.params.id, error: error.message });
    next(error);
  }
});

/**
 * POST /api/scenarios
 * Create and run a new scenario
 */
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;

    const response = await axios.post(
      `${SCENARIO_URL}/scenarios`,
      req.body,
      {
        headers: { 'X-Tenant-ID': tenantId },
      }
    );

    res.status(201).json(response.data);
  } catch (error: any) {
    logger.error('Error creating scenario', { error: error.message });
    next(error);
  }
});

/**
 * DELETE /api/scenarios/:id
 * Delete a scenario
 */
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { tenantId } = req.user!;
    const { id } = req.params;

    await axios.delete(`${SCENARIO_URL}/scenarios/${id}`, {
      headers: { 'X-Tenant-ID': tenantId },
    });

    res.status(204).send();
  } catch (error: any) {
    logger.error('Error deleting scenario', { scenarioId: req.params.id, error: error.message });
    next(error);
  }
});

export default router;
