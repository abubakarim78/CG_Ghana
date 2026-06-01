import { Router, Request, Response } from 'express';
import { handleUSSD } from './flow';
import { formatGhanaPhone } from '../utils/phoneFormatter';
import { logger } from '../utils/logger';
import type {
  HubtelUSSDRequest,
  HubtelUSSDResponse,
  ATUSSDRequest,
  NormalisedUSSDRequest,
  StepResult,
} from './types';

const router: import('express').Router = Router();

// ── Hubtel adapter ────────────────────────────────────────────────────────────
// POST /api/ussd/hubtel
router.post('/hubtel', async (req: Request, res: Response) => {
  const body = req.body as HubtelUSSDRequest;

  if (!body.SessionId || !body.Mobile) {
    res.status(400).json({ Type: 'Release', Message: 'Bad request' });
    return;
  }

  let phone: string;
  try {
    phone = formatGhanaPhone(body.Mobile);
  } catch {
    res.status(400).json({ Type: 'Release', Message: 'Invalid phone number' });
    return;
  }

  const normalised: NormalisedUSSDRequest = {
    sessionId: body.SessionId,
    phone,
    serviceCode: body.ServiceCode,
    input: body.Type === 'Initiation' ? '' : (body.Message ?? '').trim(),
    isNew: body.Type === 'Initiation',
    operator: body.Operator,
  };

  // Hubtel sends Type=Release when the user drops — clean up session
  if (body.Type === 'Release' || body.Type === 'Timeout') {
    logger.debug('Hubtel session released/timeout', { sessionId: body.SessionId });
    res.json({ Type: 'Release', Message: '' });
    return;
  }

  let result: StepResult;
  try {
    result = await handleUSSD(normalised);
  } catch (err) {
    logger.error('USSD Hubtel handler error', { err });
    res.json({ Type: 'Release', Message: 'Service error. Please try again.' } satisfies HubtelUSSDResponse);
    return;
  }

  const response: HubtelUSSDResponse = {
    Type: result.type === 'CON' ? 'Response' : 'Release',
    Message: result.text,
  };
  res.json(response);
});

// ── Africa's Talking adapter ──────────────────────────────────────────────────
// POST /api/ussd/at
// Body is application/x-www-form-urlencoded
// Africa's Talking sends the FULL input chain as a *-separated string, e.g. "1*2*10"
// We only care about the LAST segment (the latest user input).
router.post('/at', async (req: Request, res: Response) => {
  const body = req.body as ATUSSDRequest;

  if (!body.sessionId || !body.phoneNumber) {
    res.type('text').send('END Bad request');
    return;
  }

  let phone: string;
  try {
    phone = formatGhanaPhone(body.phoneNumber);
  } catch {
    res.type('text').send('END Invalid phone number');
    return;
  }

  // AT sends accumulated input "1*2*10"; split to get only the latest entry
  const parts = (body.text ?? '').split('*');
  const latestInput = parts[parts.length - 1] ?? '';
  const isNew = body.text === '' || body.text === undefined;

  const normalised: NormalisedUSSDRequest = {
    sessionId: body.sessionId,
    phone,
    serviceCode: body.serviceCode,
    input: isNew ? '' : latestInput,
    isNew,
    operator: body.networkCode,
  };

  let result: StepResult;
  try {
    result = await handleUSSD(normalised);
  } catch (err) {
    logger.error('USSD AT handler error', { err });
    res.type('text').send('END Service error. Please try again.');
    return;
  }

  // Africa's Talking expects plain-text: "CON ..." or "END ..."
  res.type('text').send(`${result.type} ${result.text}`);
});

export default router;
