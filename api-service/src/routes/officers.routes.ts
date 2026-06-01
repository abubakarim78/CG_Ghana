import { Router } from 'express';
import { z } from 'zod';
import { officersService } from '../services/officers.service';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

const officerSchema = z.object({
  name: z.string().min(2),
  badge: z.string().min(3),
  district: z.string().min(2),
  region: z.string().min(2),
  role: z.enum(['social_worker', 'police_dovvsu', 'labour_inspector', 'ngo_agent']),
  languages: z.array(z.string()).min(1),
  phone: z.string().min(9),
  userId: z.string().optional(),
});

router.get('/', authenticate, requireRole('officer', 'admin'), async (req, res, next) => {
  try {
    const { district, region } = req.query as Record<string, string>;
    const list = await officersService.list({ district, region });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, requireRole('officer', 'admin'), async (req, res, next) => {
  try {
    const o = await officersService.getById(req.params.id);
    if (!o) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(o);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const body = officerSchema.parse(req.body);
    const o = await officersService.create(body);
    res.status(201).json(o);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const body = officerSchema.partial().parse(req.body);
    const o = await officersService.update(req.params.id, body);
    res.json(o);
  } catch (err) {
    next(err);
  }
});

export default router;
