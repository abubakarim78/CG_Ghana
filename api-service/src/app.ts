import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import { config } from './config';
import { logger } from './utils/logger';

import authRoutes from './routes/auth.routes';
import casesRoutes from './routes/cases.routes';
import officersRoutes from './routes/officers.routes';
import emergencyRoutes from './routes/emergency.routes';
import statsRoutes from './routes/stats.routes';
import uploadRoutes from './routes/upload.routes';

const app: express.Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

const emergencyLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api/emergency', emergencyLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/officers', officersRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'childguard-api', env: config.NODE_ENV });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation error', issues: err.flatten().fieldErrors });
    return;
  }

  if (err && typeof err === 'object' && 'status' in err) {
    const e = err as { status: number; message: string };
    res.status(e.status).json({ error: e.message });
    return;
  }

  logger.error('Unhandled error', { err });
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
