import { Router } from 'express';
import { statsService } from '../services/stats.service';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, requireRole('officer', 'admin'), async (_req, res, next) => {
  try {
    const data = await statsService.dashboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/heatmap', authenticate, requireRole('officer', 'admin'), async (_req, res, next) => {
  try {
    const data = await statsService.heatmap();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
