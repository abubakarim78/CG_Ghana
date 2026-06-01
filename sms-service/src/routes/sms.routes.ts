import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  notifyCaseUpdate,
  broadcastEmergency,
  notifyOfficerAssignment,
  sendCustomSMS,
  sendBulkSMS,
} from '../services/sms.service';
import { requireApiKey } from '../middleware/auth';
import { logger } from '../utils/logger';

const router: import('express').Router = Router();
router.use(requireApiKey);

// Zod schemas
const CaseUpdateSchema = z.object({
  caseId: z.string().min(1),
  status: z.enum(['submitted', 'assigned', 'investigating', 'intervention', 'resolved']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  district: z.string().min(1),
  region: z.string().min(1),
  reporterPhone: z.string().optional(),
  officerPhone: z.string().optional(),
  officerName: z.string().optional(),
});

const EmergencySchema = z.object({
  caseId: z.string().min(1),
  district: z.string().min(1),
  region: z.string().min(1),
  description: z.string().min(1),
  officerPhones: z.array(z.string()).min(1),
});

const OfficerAssignSchema = z.object({
  caseId: z.string().min(1),
  officerPhone: z.string().min(1),
  officerName: z.string().min(1),
  caseType: z.string().min(1),
  district: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

const CustomSMSSchema = z.object({
  to: z.string().min(1),
  body: z.string().min(1).max(640),
});

const BulkSMSSchema = z.object({
  phones: z.array(z.string()).min(1).max(500),
  body: z.string().min(1).max(640),
});

// POST /api/sms/case-update
router.post('/case-update', async (req: Request, res: Response) => {
  const parsed = CaseUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    await notifyCaseUpdate(parsed.data);
    res.json({ ok: true });
  } catch (err) {
    logger.error('case-update route error', { err });
    res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/sms/emergency
router.post('/emergency', async (req: Request, res: Response) => {
  const parsed = EmergencySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const result = await broadcastEmergency(parsed.data);
    res.json(result);
  } catch (err) {
    logger.error('emergency route error', { err });
    res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/sms/officer-assign
router.post('/officer-assign', async (req: Request, res: Response) => {
  const parsed = OfficerAssignSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const result = await notifyOfficerAssignment(parsed.data);
    res.json(result);
  } catch (err) {
    logger.error('officer-assign route error', { err });
    res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/sms/send  (admin: single custom SMS)
router.post('/send', async (req: Request, res: Response) => {
  const parsed = CustomSMSSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const result = await sendCustomSMS(parsed.data.to, parsed.data.body);
    res.json(result);
  } catch (err) {
    logger.error('send route error', { err });
    res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/sms/bulk  (admin: bulk broadcast)
router.post('/bulk', async (req: Request, res: Response) => {
  const parsed = BulkSMSSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const result = await sendBulkSMS(parsed.data.phones, parsed.data.body);
    res.json(result);
  } catch (err) {
    logger.error('bulk route error', { err });
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
