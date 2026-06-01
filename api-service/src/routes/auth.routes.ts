import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  password: z.string().min(8),
  role: z.enum(['reporter', 'officer', 'admin']).optional(),
});

const loginSchema = z.object({
  phone: z.string().min(9),
  password: z.string().min(1),
});

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await authService.register(body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);
    const result = await authService.login(phone, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/anonymous', async (_req, res, next) => {
  try {
    const result = await authService.loginAnonymous();
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/push-token', authenticate, async (req, res, next) => {
  try {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.body);
    await authService.savePushToken(req.user!.sub, token);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
