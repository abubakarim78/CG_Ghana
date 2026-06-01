import type { USSDSession, USSDStep, USSDCaseDraft } from './types';
import { logger } from '../utils/logger';

// Sessions expire after 3 minutes of inactivity (USSD network timeout is ~3 min)
const SESSION_TTL_MS = 3 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

const store = new Map<string, USSDSession>();

function now(): number {
  return new global.Date().getTime();
}

export function createSession(
  sessionId: string,
  phone: string,
  operator = 'UNKNOWN'
): USSDSession {
  const session: USSDSession = {
    sessionId,
    phone,
    operator,
    step: 'MAIN_MENU',
    draft: {},
    createdAt: now(),
    updatedAt: now(),
  };
  store.set(sessionId, session);
  logger.debug('USSD session created', { sessionId, phone });
  return session;
}

export function getSession(sessionId: string): USSDSession | undefined {
  const session = store.get(sessionId);
  if (!session) return undefined;

  if (now() - session.updatedAt > SESSION_TTL_MS) {
    store.delete(sessionId);
    logger.debug('USSD session expired', { sessionId });
    return undefined;
  }
  return session;
}

export function updateSession(
  sessionId: string,
  step: USSDStep,
  draftPatch: Partial<USSDCaseDraft> = {}
): USSDSession | undefined {
  const session = getSession(sessionId);
  if (!session) return undefined;

  session.step = step;
  session.draft = { ...session.draft, ...draftPatch };
  session.updatedAt = now();
  return session;
}

export function deleteSession(sessionId: string): void {
  store.delete(sessionId);
}

// Periodic cleanup of expired sessions
setInterval(() => {
  const cutoff = now() - SESSION_TTL_MS;
  let removed = 0;
  for (const [id, session] of store.entries()) {
    if (session.updatedAt < cutoff) {
      store.delete(id);
      removed++;
    }
  }
  if (removed > 0) logger.debug('USSD session GC', { removed, remaining: store.size });
}, CLEANUP_INTERVAL_MS);
