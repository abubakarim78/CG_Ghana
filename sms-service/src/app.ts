import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import smsRoutes from './routes/sms.routes';
import webhookRoutes from './routes/webhook.routes';
import ussdRoutes from './ussd/routes';
import { logger } from './utils/logger';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '64kb' }));

// Rate limiting — internal API
const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

// Stricter limiter for emergency broadcast to prevent abuse
const emergencyLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// USSD endpoints accept both JSON (Hubtel) and form-encoded (Africa's Talking)
app.use('/api/ussd', express.urlencoded({ extended: false, limit: '16kb' }));

// Rate limiting — internal API
const ussdLimiter = rateLimit({
  windowMs: 60_000,
  max: 500,   // USSD generates many rapid requests per user session
  standardHeaders: true,
  legacyHeaders: false,
  message: 'END Too many requests. Please try again.',
});

app.use('/api/sms', apiLimiter);
app.use('/api/sms/emergency', emergencyLimiter);
app.use('/api/sms', smsRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/ussd', ussdLimiter, ussdRoutes);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'childguard-sms-service',
    env: config.nodeEnv,
    sandbox: config.arkesel.sandbox,
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { err });
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
