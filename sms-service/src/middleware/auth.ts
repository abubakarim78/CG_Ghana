import type { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/** Protects internal API endpoints — requires X-API-Key header. */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'];
  if (!key || key !== config.internalApiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

/** Validates incoming Arkesel webhook using shared secret query param. */
export function requireWebhookSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = (req.query['secret'] as string) ?? req.headers['x-webhook-secret'];
  if (!secret || secret !== config.webhookSecret) {
    res.status(401).json({ error: 'Invalid webhook secret' });
    return;
  }
  next();
}
