import { sendSingleSMS } from './arkesel.service';
import { optOut, optIn } from './sms.service';
import * as templates from './template.service';
import { formatGhanaPhone } from '../utils/phoneFormatter';
import { logger } from '../utils/logger';
import type { ArkeselIncomingWebhook, ParsedIncomingSMS, IncomingCommand } from '../types';

// Stub: in production this fetches from your database
async function lookupCase(caseId: string): Promise<{ status: string; district: string } | null> {
  // TODO: replace with real DB/API call
  void caseId;
  return null;
}

function parseIncoming(raw: ArkeselIncomingWebhook): ParsedIncomingSMS {
  const parts = raw.message.trim().toUpperCase().split(/\s+/);
  const keyword = parts[0] as string;
  const args = parts.slice(1);

  const COMMAND_MAP: Record<string, IncomingCommand> = {
    STATUS: 'STATUS',
    HELP: 'HELP',
    '?': 'HELP',
    STOP: 'STOP',
    UNSUBSCRIBE: 'STOP',
    START: 'STATUS', // re-subscribe intent, handled separately
    OPT: 'STOP',     // "OPT OUT"
  };

  // "START" means opt-in, handle before mapping to avoid treating as STATUS
  if (keyword === 'START' || keyword === 'SUBSCRIBE') {
    return { command: 'UNKNOWN', args: ['__OPT_IN__'], rawMessage: raw.message, senderPhone: raw.sender };
  }

  const command: IncomingCommand = COMMAND_MAP[keyword] ?? 'UNKNOWN';
  return { command, args, rawMessage: raw.message, senderPhone: raw.sender };
}

export async function handleIncomingSMS(webhook: ArkeselIncomingWebhook): Promise<void> {
  const parsed = parseIncoming(webhook);
  const senderPhone = formatGhanaPhone(parsed.senderPhone);

  logger.info('Incoming SMS', { from: senderPhone, command: parsed.command, raw: parsed.rawMessage });

  // Opt-in shortcode
  if (parsed.args[0] === '__OPT_IN__') {
    optIn(senderPhone);
    await sendSingleSMS(senderPhone, templates.optInConfirmationSMS());
    return;
  }

  switch (parsed.command) {
    case 'STOP': {
      optOut(senderPhone);
      await sendSingleSMS(senderPhone, templates.optOutConfirmationSMS());
      break;
    }

    case 'HELP': {
      await sendSingleSMS(senderPhone, templates.helpReplySMS());
      break;
    }

    case 'STATUS': {
      const caseId = parsed.args[0];
      if (!caseId) {
        await sendSingleSMS(senderPhone, templates.helpReplySMS());
        break;
      }

      const caseData = await lookupCase(caseId);
      if (!caseData) {
        await sendSingleSMS(senderPhone, templates.caseNotFoundReplySMS(caseId));
      } else {
        await sendSingleSMS(
          senderPhone,
          templates.statusQueryReplySMS(caseId, caseData.status as any, caseData.district)
        );
      }
      break;
    }

    default: {
      // Unknown message — send help
      await sendSingleSMS(senderPhone, templates.helpReplySMS());
      break;
    }
  }
}
