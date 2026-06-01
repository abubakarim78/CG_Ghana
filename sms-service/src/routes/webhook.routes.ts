import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { handleIncomingSMS } from '../services/incoming.service';
import { requireWebhookSecret } from '../middleware/auth';
import { logger } from '../utils/logger';

const router: import('express').Router = Router();

// Arkesel sends a GET or POST to this URL when a message is received on your number
// URL format: POST /api/webhook/incoming?secret=<WEBHOOK_SECRET>

const IncomingSchema = z.object({
  sender: z.string().min(1),
  message: z.string().min(1),
  date: z.string(),
  id: z.string(),
});

router.post('/incoming', requireWebhookSecret, async (req: Request, res: Response) => {
  const parsed = IncomingSchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn('Malformed incoming webhook payload', { body: req.body });
    // Always 200 so Arkesel doesn't retry indefinitely
    res.status(200).json({ ok: false, error: 'malformed payload' });
    return;
  }

  // Respond immediately; process async so Arkesel gets a fast ACK
  res.status(200).json({ ok: true });

  handleIncomingSMS(parsed.data).catch((err) => {
    logger.error('handleIncomingSMS threw', { err });
  });
});

// Arkesel delivery report webhook (optional, for tracking)
const DeliveryReportSchema = z.object({
  id: z.string(),
  status: z.string(),
  recipient: z.string(),
});

router.post('/delivery', requireWebhookSecret, (req: Request, res: Response) => {
  const parsed = DeliveryReportSchema.safeParse(req.body);
  if (parsed.success) {
    logger.info('SMS delivery report', parsed.data);
  }
  res.status(200).json({ ok: true });
});

export default router;
