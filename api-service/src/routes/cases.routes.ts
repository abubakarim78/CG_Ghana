import { Router } from 'express';
import { z } from 'zod';
import { casesService } from '../services/cases.service';
import { authenticate, requireRole } from '../middleware/auth';
import { CasePriority, CaseStatus } from '@prisma/client';

const router = Router();

const locationSchema = z.object({
  district: z.string(),
  region: z.string(),
  lat: z.number(),
  lng: z.number(),
  description: z.string().optional(),
});

const submitSchema = z.object({
  type: z.enum([
    'child_labour_agriculture', 'child_labour_fishing', 'child_labour_mining',
    'child_labour_domestic', 'child_labour_manufacturing', 'child_labour_street',
    'trafficking_labour', 'trafficking_sexual', 'trafficking_domestic',
    'neglect', 'early_marriage', 'physical_abuse',
  ]),
  childAge: z.number().int().min(0).max(17),
  childGender: z.enum(['male', 'female', 'unknown']),
  location: locationSchema,
  description: z.string().min(1, 'Description is required'),
  photos: z.array(z.string().url()).default([]),
  isAnonymous: z.boolean(),
  isEmergency: z.boolean(),
  dangerTriage: z.object({
    withPerp: z.boolean(),
    recentViolence: z.boolean(),
    noBasicNeeds: z.boolean(),
  }),
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const body = submitSchema.parse(req.body);
    const newCase = await casesService.submit({
      ...body,
      reporterId: req.user!.isAnonymous ? undefined : req.user!.sub,
    });
    res.status(201).json(newCase);
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, priority, region } = req.query as Record<string, string>;
    const user = req.user!;

    let officerFilter: { officerId?: string } = {};

    if (user.role === 'reporter') {
      // reporters only see their own submitted cases
      const cases = await casesService.list({
        status: status as CaseStatus | undefined,
        priority: priority as CasePriority | undefined,
        region,
        reporterId: user.sub,
      });
      return res.json(cases);
    }

    if (user.role === 'officer') {
      // officers only see cases assigned to them
      const { prisma } = await import('../db');
      const officer = await prisma.officer.findUnique({
        where: { userId: user.sub },
        select: { id: true },
      });
      if (officer) officerFilter = { officerId: officer.id };
    }

    // admins see all cases (no extra filter)
    const cases = await casesService.list({
      status: status as CaseStatus | undefined,
      priority: priority as CasePriority | undefined,
      region,
      ...officerFilter,
    });
    res.json(cases);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const param = req.params.id;
    // Accept both internal cuid and human-readable case number (e.g. CG-2026-00001)
    const c = param.startsWith('CG-')
      ? await casesService.getByNumber(param)
      : await casesService.getById(param);

    if (!c) { res.status(404).json({ error: 'Not found' }); return; }

    // reporters can only view their own
    if (req.user!.role === 'reporter' && c.reporterId !== req.user!.sub && !c.isAnonymous) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.json(c);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', authenticate, requireRole('officer', 'admin'), async (req, res, next) => {
  try {
    const { status, note } = z.object({
      status: z.enum(['submitted', 'assigned', 'investigating', 'intervention', 'resolved']),
      note: z.string().min(1),
    }).parse(req.body);

    const c = await casesService.getById(req.params.id);
    if (!c) { res.status(404).json({ error: 'Not found' }); return; }

    const officerName = req.user!.role === 'officer'
      ? (await import('../db').then(({ prisma }) =>
          prisma.officer.findUnique({ where: { userId: req.user!.sub } })
        ).then((o) => o?.name ?? 'Officer'))
      : 'Admin';

    const updated = await casesService.updateStatus(
      req.params.id,
      status as CaseStatus,
      note,
      officerName,
      req.user!.role === 'officer' ? undefined : undefined
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/assign', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { officerId } = z.object({ officerId: z.string().min(1) }).parse(req.body);
    const updated = await casesService.assignOfficer(req.params.id, officerId, 'Admin');
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
