import * as sessionStore from './session.store';
import { broadcastEmergency, notifyCaseUpdate } from '../services/sms.service';
import { logger } from '../utils/logger';
import type { NormalisedUSSDRequest, StepResult, USSDSession } from './types';

// ── Case type mappings ────────────────────────────────────────────────────────

const CASE_TYPE_MENU = [
  'child_labour',
  'trafficking',
  'neglect',
  'early_marriage',
] as const;

const LABOUR_TYPE_MENU = [
  'child_labour_agriculture',
  'child_labour_fishing',
  'child_labour_mining',
  'child_labour_street',
] as const;

const TRAFFICKING_TYPE_MENU = [
  'trafficking_labour',
  'trafficking_sexual',
  'trafficking_domestic',
] as const;

const CASE_TYPE_LABELS: Record<string, string> = {
  child_labour_agriculture: 'Labour-Agriculture',
  child_labour_fishing:     'Labour-Fishing',
  child_labour_mining:      'Labour-Mining',
  child_labour_street:      'Labour-Street/Domestic',
  trafficking_labour:       'Trafficking-Labour',
  trafficking_sexual:       'Trafficking-Sexual',
  trafficking_domestic:     'Trafficking-Domestic',
  neglect:                  'Neglect/Abuse',
  early_marriage:           'Early Marriage',
};

const GENDER_MAP: Record<string, 'male' | 'female' | 'unknown'> = {
  '1': 'male',
  '2': 'female',
  '3': 'unknown',
};

// ── ID generator (no Date.now — uses session createdAt + counter) ─────────────
let caseCounter = 1000;
function generateCaseId(session: USSDSession): string {
  const ts = new global.Date(session.createdAt);
  const y = ts.getFullYear();
  const m = String(ts.getMonth() + 1).padStart(2, '0');
  const d = String(ts.getDate()).padStart(2, '0');
  caseCounter += 1;
  return `CG-${y}${m}${d}-${caseCounter}`;
}

// ── Stub: submit case to your API / database ──────────────────────────────────
// TODO: Replace with real API call or DB write
async function submitCase(session: USSDSession): Promise<string> {
  const draft = session.draft;
  const caseId = generateCaseId(session);
  logger.info('USSD case submission', {
    caseId,
    caseType: draft.caseType,
    childAge: draft.childAge,
    childGender: draft.childGender,
    location: draft.location,
    description: draft.description?.slice(0, 80),
    isAnonymous: draft.isAnonymous,
    phone: draft.isAnonymous ? '[hidden]' : session.phone,
  });

  // Notify officer via SMS after case is created (priority heuristic)
  await notifyCaseUpdate({
    caseId,
    status: 'submitted',
    priority: 'high',
    district: draft.location ?? 'Unknown',
    region: 'Ghana',
    reporterPhone: draft.isAnonymous ? undefined : session.phone,
  }).catch((err) => logger.error('Post-USSD SMS notify failed', { err }));

  return caseId;
}

// ── Emergency handler ─────────────────────────────────────────────────────────
// TODO: look up nearest officers from DB by location
async function triggerEmergency(phone: string): Promise<void> {
  await broadcastEmergency({
    caseId: 'EMERGENCY',
    district: 'Reporter District',
    region: 'Ghana',
    description: `Emergency reported via USSD from ${phone}`,
    officerPhones: [],  // TODO: populate from DB query by district
  });
}

// ── Menu screens ──────────────────────────────────────────────────────────────

const MAIN_MENU = `ChildGuard Ghana
1. Report a Case
2. Check Case Status
3. EMERGENCY Alert
4. Help & Hotline`;

const CASE_TYPE_SCREEN = `Select Case Type:
1. Child Labour
2. Trafficking
3. Neglect / Abuse
4. Early Marriage
0. Back`;

const LABOUR_TYPE_SCREEN = `Child Labour Type:
1. Agriculture/Farm
2. Fishing
3. Mining
4. Street/Domestic
0. Back`;

const TRAFFICKING_TYPE_SCREEN = `Trafficking Type:
1. Labour
2. Sexual Exploitation
3. Domestic Servitude
0. Back`;

const CHILD_GENDER_SCREEN = `Child's gender:
1. Male
2. Female
3. Unknown`;

const ANONYMOUS_SCREEN = `Submit as:
1. Anonymous (recommended)
2. Include my number`;

// ── Main dispatch ─────────────────────────────────────────────────────────────

export async function handleUSSD(req: NormalisedUSSDRequest): Promise<StepResult> {
  // New session
  if (req.isNew) {
    sessionStore.createSession(req.sessionId, req.phone, req.operator ?? 'UNKNOWN');
    return { type: 'CON', text: MAIN_MENU };
  }

  const session = sessionStore.getSession(req.sessionId);
  if (!session) {
    return { type: 'END', text: 'Session expired. Please dial again.' };
  }

  const input = req.input.trim();

  try {
    return await dispatch(session, input);
  } catch (err) {
    logger.error('USSD flow error', { sessionId: req.sessionId, step: session.step, err });
    sessionStore.deleteSession(req.sessionId);
    return { type: 'END', text: 'An error occurred. Please try again or call 080010400.' };
  }
}

async function dispatch(session: USSDSession, input: string): Promise<StepResult> {
  switch (session.step) {

    case 'MAIN_MENU':
      return handleMainMenu(session, input);

    case 'CASE_TYPE':
      return handleCaseType(session, input);

    case 'LABOUR_TYPE':
      return handleLabourType(session, input);

    case 'TRAFFICKING_TYPE':
      return handleTraffickingType(session, input);

    case 'CHILD_AGE':
      return handleChildAge(session, input);

    case 'CHILD_GENDER':
      return handleChildGender(session, input);

    case 'LOCATION':
      return handleLocation(session, input);

    case 'DESCRIPTION':
      return handleDescription(session, input);

    case 'ANONYMOUS_CHOICE':
      return handleAnonymousChoice(session, input);

    case 'CONFIRM_SUBMIT':
      return handleConfirmSubmit(session, input);

    case 'STATUS_QUERY':
      return handleStatusQuery(session, input);

    case 'EMERGENCY_CONFIRM':
      return handleEmergencyConfirm(session, input);

    default:
      sessionStore.deleteSession(session.sessionId);
      return { type: 'END', text: 'Invalid session state. Please dial again.' };
  }
}

// ── Step handlers ─────────────────────────────────────────────────────────────

function handleMainMenu(session: USSDSession, input: string): StepResult {
  switch (input) {
    case '1':
      sessionStore.updateSession(session.sessionId, 'CASE_TYPE');
      return { type: 'CON', text: CASE_TYPE_SCREEN };

    case '2':
      sessionStore.updateSession(session.sessionId, 'STATUS_QUERY');
      return { type: 'CON', text: 'Enter your Case ID\n(e.g. CG-20260601-1234):' };

    case '3':
      sessionStore.updateSession(session.sessionId, 'EMERGENCY_CONFIRM');
      return {
        type: 'CON',
        text: 'EMERGENCY ALERT\nOfficers will be notified immediately.\n1. Confirm\n2. Cancel',
      };

    case '4':
      sessionStore.deleteSession(session.sessionId);
      return {
        type: 'END',
        text: 'ChildGuard Help\nHotline: 080010400 (free, 24/7)\nSMS "STATUS <CaseID>" to check status\nAll reports are confidential.',
      };

    default:
      return { type: 'CON', text: `Invalid choice.\n${MAIN_MENU}` };
  }
}

function handleCaseType(session: USSDSession, input: string): StepResult {
  if (input === '0') {
    sessionStore.updateSession(session.sessionId, 'MAIN_MENU');
    return { type: 'CON', text: MAIN_MENU };
  }

  const idx = parseInt(input, 10) - 1;
  const picked = CASE_TYPE_MENU[idx];
  if (!picked) return { type: 'CON', text: `Invalid choice.\n${CASE_TYPE_SCREEN}` };

  if (picked === 'child_labour') {
    sessionStore.updateSession(session.sessionId, 'LABOUR_TYPE');
    return { type: 'CON', text: LABOUR_TYPE_SCREEN };
  }

  if (picked === 'trafficking') {
    sessionStore.updateSession(session.sessionId, 'TRAFFICKING_TYPE');
    return { type: 'CON', text: TRAFFICKING_TYPE_SCREEN };
  }

  // neglect / early_marriage — go straight to age
  sessionStore.updateSession(session.sessionId, 'CHILD_AGE', { caseType: picked });
  return { type: 'CON', text: "Enter child's age\n(numbers only, e.g. 10):" };
}

function handleLabourType(session: USSDSession, input: string): StepResult {
  if (input === '0') {
    sessionStore.updateSession(session.sessionId, 'CASE_TYPE');
    return { type: 'CON', text: CASE_TYPE_SCREEN };
  }
  const idx = parseInt(input, 10) - 1;
  const picked = LABOUR_TYPE_MENU[idx];
  if (!picked) return { type: 'CON', text: `Invalid choice.\n${LABOUR_TYPE_SCREEN}` };

  sessionStore.updateSession(session.sessionId, 'CHILD_AGE', { caseType: picked });
  return { type: 'CON', text: "Enter child's age\n(numbers only, e.g. 10):" };
}

function handleTraffickingType(session: USSDSession, input: string): StepResult {
  if (input === '0') {
    sessionStore.updateSession(session.sessionId, 'CASE_TYPE');
    return { type: 'CON', text: CASE_TYPE_SCREEN };
  }
  const idx = parseInt(input, 10) - 1;
  const picked = TRAFFICKING_TYPE_MENU[idx];
  if (!picked) return { type: 'CON', text: `Invalid choice.\n${TRAFFICKING_TYPE_SCREEN}` };

  sessionStore.updateSession(session.sessionId, 'CHILD_AGE', { caseType: picked });
  return { type: 'CON', text: "Enter child's age\n(numbers only, e.g. 10):" };
}

function handleChildAge(session: USSDSession, input: string): StepResult {
  const age = parseInt(input, 10);
  if (isNaN(age) || age < 1 || age > 17) {
    return { type: 'CON', text: "Please enter a valid age\nbetween 1 and 17:" };
  }
  sessionStore.updateSession(session.sessionId, 'CHILD_GENDER', { childAge: age });
  return { type: 'CON', text: CHILD_GENDER_SCREEN };
}

function handleChildGender(session: USSDSession, input: string): StepResult {
  const gender = GENDER_MAP[input];
  if (!gender) return { type: 'CON', text: `Invalid choice.\n${CHILD_GENDER_SCREEN}` };

  sessionStore.updateSession(session.sessionId, 'LOCATION', { childGender: gender });
  return { type: 'CON', text: 'Enter district or community\n(e.g. Kumasi, Tamale, Accra):' };
}

function handleLocation(session: USSDSession, input: string): StepResult {
  const location = input.trim();
  if (!location || location.length < 2) {
    return { type: 'CON', text: 'Please enter a location\n(e.g. Kumasi, Tamale, Accra):' };
  }
  sessionStore.updateSession(session.sessionId, 'DESCRIPTION', {
    location: location.slice(0, 50),
  });
  return { type: 'CON', text: 'Briefly describe what you saw\n(max 100 characters):' };
}

function handleDescription(session: USSDSession, input: string): StepResult {
  const description = input.trim();
  if (!description || description.length < 5) {
    return { type: 'CON', text: 'Please describe the case\n(at least 5 characters):' };
  }
  sessionStore.updateSession(session.sessionId, 'ANONYMOUS_CHOICE', {
    description: description.slice(0, 100),
  });
  return { type: 'CON', text: ANONYMOUS_SCREEN };
}

function handleAnonymousChoice(session: USSDSession, input: string): StepResult {
  if (input !== '1' && input !== '2') {
    return { type: 'CON', text: `Invalid choice.\n${ANONYMOUS_SCREEN}` };
  }
  const isAnonymous = input === '1';
  sessionStore.updateSession(session.sessionId, 'CONFIRM_SUBMIT', { isAnonymous });

  const d = { ...session.draft, isAnonymous };
  const typeLabel = CASE_TYPE_LABELS[d.caseType ?? ''] ?? 'Unknown';
  const genderLabel = d.childGender ?? 'Unknown';
  const anonLabel = isAnonymous ? 'Anonymous' : 'With your number';

  const summary =
    `CONFIRM REPORT:\n` +
    `Type: ${typeLabel}\n` +
    `Age: ${d.childAge} | Gender: ${genderLabel}\n` +
    `Area: ${d.location}\n` +
    `Submit: ${anonLabel}\n` +
    `1. Submit  2. Cancel`;

  return { type: 'CON', text: summary };
}

async function handleConfirmSubmit(session: USSDSession, input: string): Promise<StepResult> {
  if (input === '2') {
    sessionStore.deleteSession(session.sessionId);
    return { type: 'END', text: 'Report cancelled.\nDial again to start over.\nHotline: 080010400' };
  }
  if (input !== '1') {
    const d = session.draft;
    const typeLabel = CASE_TYPE_LABELS[d.caseType ?? ''] ?? 'Unknown';
    return {
      type: 'CON',
      text:
        `Invalid choice.\nCONFIRM:\nType: ${typeLabel}\nArea: ${d.location}\n` +
        `1. Submit  2. Cancel`,
    };
  }

  const caseId = await submitCase(session);
  sessionStore.deleteSession(session.sessionId);

  return {
    type: 'END',
    text:
      `CASE SUBMITTED\nID: ${caseId}\n` +
      `Save this ID. You will receive SMS updates.\n` +
      `To check status SMS: STATUS ${caseId}\n` +
      `Hotline: 080010400`,
  };
}

// Stub: look up case status from DB
async function lookupCaseStatus(caseId: string): Promise<{ status: string; district: string } | null> {
  // TODO: replace with real DB/API call
  void caseId;
  return null;
}

async function handleStatusQuery(session: USSDSession, input: string): Promise<StepResult> {
  const caseId = input.trim().toUpperCase();
  if (!caseId || caseId.length < 4) {
    return { type: 'CON', text: 'Please enter a valid Case ID\n(e.g. CG-20260601-1234):' };
  }

  const found = await lookupCaseStatus(caseId);
  sessionStore.deleteSession(session.sessionId);

  if (!found) {
    return {
      type: 'END',
      text: `Case "${caseId}" not found.\nCheck the ID and try again.\nHotline: 080010400`,
    };
  }

  const STATUS_LABELS: Record<string, string> = {
    submitted:     'Received & Under Review',
    assigned:      'Officer Assigned',
    investigating: 'Investigation Underway',
    intervention:  'Intervention In Progress',
    resolved:      'Resolved',
  };
  const label = STATUS_LABELS[found.status] ?? found.status;
  return {
    type: 'END',
    text: `Case ${caseId}\nStatus: ${label}\nDistrict: ${found.district}\nHotline: 080010400`,
  };
}

async function handleEmergencyConfirm(session: USSDSession, input: string): Promise<StepResult> {
  if (input === '2') {
    sessionStore.deleteSession(session.sessionId);
    return { type: 'END', text: 'Emergency cancelled.\nHotline: 080010400 (24/7)' };
  }
  if (input !== '1') {
    return {
      type: 'CON',
      text: 'EMERGENCY ALERT\n1. Confirm\n2. Cancel',
    };
  }

  await triggerEmergency(session.phone);
  sessionStore.deleteSession(session.sessionId);

  return {
    type: 'END',
    text: 'EMERGENCY SENT\nOfficers have been alerted.\nStay safe.\nHotline: 080010400',
  };
}
