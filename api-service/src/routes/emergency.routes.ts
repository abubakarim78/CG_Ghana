import { Router } from 'express';
import { z } from 'zod';
import { emergencyService } from '../services/emergency.service';
import { authenticate } from '../middleware/auth';

const router = Router();

const sosSchema = z.object({
  type: z.enum([
    'child_labour_agriculture', 'child_labour_fishing', 'child_labour_mining',
    'child_labour_domestic', 'child_labour_manufacturing', 'child_labour_street',
    'trafficking_labour', 'trafficking_sexual', 'trafficking_domestic',
    'neglect', 'early_marriage', 'physical_abuse',
  ]).default('physical_abuse'),
  childAge: z.number().int().min(0).max(17).default(10),
  childGender: z.enum(['male', 'female', 'unknown']).default('unknown'),
  location: z.object({
    district: z.string(),
    region: z.string(),
    lat: z.number(),
    lng: z.number(),
    description: z.string().optional(),
  }),
  description: z.string().default('Emergency SOS triggered'),
  photos: z.array(z.string()).default([]),
  isAnonymous: z.boolean().default(false),
  dangerTriage: z.object({
    withPerp: z.boolean().default(true),
    recentViolence: z.boolean().default(true),
    noBasicNeeds: z.boolean().default(false),
  }).default({ withPerp: true, recentViolence: true, noBasicNeeds: false }),
});

router.post('/sos', authenticate, async (req, res, next) => {
  try {
    const body = sosSchema.parse(req.body);
    const result = await emergencyService.triggerSOS({
      ...body,
      isEmergency: true,
      reporterId: req.user!.isAnonymous ? undefined : req.user!.sub,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
