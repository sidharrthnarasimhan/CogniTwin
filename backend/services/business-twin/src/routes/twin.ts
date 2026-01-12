import { Router } from 'express';
import { getTwinState, getTwinMetrics, syncTwin } from '../controllers/twinController';

const router = Router();

router.get('/state', getTwinState);
router.get('/metrics', getTwinMetrics);
router.post('/sync', syncTwin);

export default router;
