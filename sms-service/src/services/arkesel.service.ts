import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import type {
  ArkeselSendPayload,
  ArkeselResponse,
  SMSResult,
  BulkSMSResult,
} from '../types';

const http = axios.create({
  baseURL: config.arkesel.baseUrl,
  headers: {
    'api-key': config.arkesel.apiKey,
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

/**
 * Send one or more SMS messages via the Arkesel v2 API.
 * Returns per-recipient results; never throws — failed numbers appear in `failed`.
 */
export async function sendSMS(
  recipients: string[],
  message: string
): Promise<BulkSMSResult> {
  const payload: ArkeselSendPayload = {
    sender: config.arkesel.senderName,
    message,
    recipients,
    sandbox: config.arkesel.sandbox,
  };

  logger.debug('Arkesel send request', { recipients, sandbox: payload.sandbox });

  let data: ArkeselResponse;
  try {
    const res = await http.post<ArkeselResponse>('/sms/send', payload);
    data = res.data;
  } catch (err) {
    const axiosErr = err as AxiosError<ArkeselResponse>;
    const errorMsg =
      axiosErr.response?.data?.message ?? axiosErr.message ?? 'Unknown Arkesel error';
    logger.error('Arkesel API call failed', { error: errorMsg });

    return {
      sent: [],
      failed: recipients.map((r) => ({ success: false, recipient: r, error: errorMsg })),
      total: recipients.length,
    };
  }

  if (data.status !== 'success' || !data.data) {
    const errorMsg = data.message ?? 'Arkesel returned non-success status';
    logger.warn('Arkesel non-success response', { message: errorMsg });
    return {
      sent: [],
      failed: recipients.map((r) => ({ success: false, recipient: r, error: errorMsg })),
      total: recipients.length,
    };
  }

  const sent: SMSResult[] = [];
  const failed: SMSResult[] = [];

  for (const rec of data.data.recipients) {
    if (rec.status === 'success' || rec.status === 'queued') {
      sent.push({ success: true, recipient: rec.number, messageId: rec.id });
      logger.info('SMS queued', { recipient: rec.number, id: rec.id });
    } else {
      failed.push({ success: false, recipient: rec.number, error: rec.status });
      logger.warn('SMS failed for recipient', { recipient: rec.number, status: rec.status });
    }
  }

  return { sent, failed, total: recipients.length };
}

/**
 * Convenience wrapper for a single recipient.
 */
export async function sendSingleSMS(to: string, message: string): Promise<SMSResult> {
  const result = await sendSMS([to], message);
  return result.sent[0] ?? result.failed[0] ?? { success: false, recipient: to, error: 'No result returned' };
}
