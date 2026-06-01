import { sendSMS, sendSingleSMS } from './arkesel.service';
import * as templates from './template.service';
import { formatGhanaPhone, formatMany } from '../utils/phoneFormatter';
import { logger } from '../utils/logger';
import type {
  CaseUpdatePayload,
  EmergencyBroadcastPayload,
  OfficerAssignPayload,
  BulkSMSResult,
  SMSResult,
} from '../types';

// In-memory opt-out list. Replace with Redis/DB in production.
const optOutSet = new Set<string>();

function isOptedOut(phone: string): boolean {
  try {
    return optOutSet.has(formatGhanaPhone(phone));
  } catch {
    return false;
  }
}

export function optOut(phone: string): void {
  try {
    optOutSet.add(formatGhanaPhone(phone));
    logger.info('Phone opted out', { phone });
  } catch (err) {
    logger.warn('Could not opt out invalid phone', { phone });
  }
}

export function optIn(phone: string): void {
  try {
    optOutSet.delete(formatGhanaPhone(phone));
    logger.info('Phone opted back in', { phone });
  } catch (err) {
    logger.warn('Could not opt in invalid phone', { phone });
  }
}

/**
 * Notify reporter (if not anonymous and not opted out) and assigned officer
 * when a case status changes.
 */
export async function notifyCaseUpdate(payload: CaseUpdatePayload): Promise<void> {
  const tasks: Promise<SMSResult>[] = [];

  if (payload.reporterPhone && !isOptedOut(payload.reporterPhone)) {
    const phone = formatGhanaPhone(payload.reporterPhone);
    const body = templates.caseUpdateReporterSMS(payload);
    tasks.push(sendSingleSMS(phone, body));
  }

  if (payload.officerPhone && !isOptedOut(payload.officerPhone)) {
    const phone = formatGhanaPhone(payload.officerPhone);
    const body = templates.caseUpdateOfficerSMS(payload);
    tasks.push(sendSingleSMS(phone, body));
  }

  if (tasks.length === 0) {
    logger.debug('notifyCaseUpdate: no eligible recipients', { caseId: payload.caseId });
    return;
  }

  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === 'rejected') {
      logger.error('Case update SMS task rejected', { reason: r.reason });
    }
  }
}

/**
 * Broadcast an emergency alert to every officer phone in the list.
 * Opted-out phones are silently skipped.
 */
export async function broadcastEmergency(
  payload: EmergencyBroadcastPayload
): Promise<BulkSMSResult> {
  const eligible = payload.officerPhones
    .filter((p) => !isOptedOut(p))
    .map((p) => formatGhanaPhone(p));

  if (eligible.length === 0) {
    logger.warn('broadcastEmergency: all recipients opted out or list empty', {
      caseId: payload.caseId,
    });
    return { sent: [], failed: [], total: 0 };
  }

  const body = templates.emergencyBroadcastSMS(payload);
  logger.info('Broadcasting emergency SMS', { caseId: payload.caseId, count: eligible.length });
  return sendSMS(eligible, body);
}

/**
 * Notify an officer when they are assigned to a case.
 */
export async function notifyOfficerAssignment(
  payload: OfficerAssignPayload
): Promise<SMSResult> {
  if (isOptedOut(payload.officerPhone)) {
    logger.debug('Officer opted out; skipping assignment SMS', { phone: payload.officerPhone });
    return { success: false, recipient: payload.officerPhone, error: 'opted_out' };
  }

  const phone = formatGhanaPhone(payload.officerPhone);
  const body = templates.officerAssignSMS(payload);
  logger.info('Sending officer assignment SMS', { caseId: payload.caseId, officer: payload.officerName });
  return sendSingleSMS(phone, body);
}

/**
 * Send a free-form SMS to a single recipient (for admin use).
 */
export async function sendCustomSMS(to: string, body: string): Promise<SMSResult> {
  if (isOptedOut(to)) {
    return { success: false, recipient: to, error: 'opted_out' };
  }
  const phone = formatGhanaPhone(to);
  return sendSingleSMS(phone, body);
}

/**
 * Send a bulk broadcast to a list of phones (admin broadcasts, drills, etc.).
 */
export async function sendBulkSMS(
  phones: string[],
  body: string
): Promise<BulkSMSResult> {
  const eligible = phones.filter((p) => !isOptedOut(p));
  const skipped = phones.length - eligible.length;
  if (skipped > 0) logger.debug('Bulk SMS: skipped opted-out numbers', { skipped });
  if (eligible.length === 0) return { sent: [], failed: [], total: 0 };
  return sendSMS(formatMany(eligible), body);
}
