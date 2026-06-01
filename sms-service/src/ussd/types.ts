// ── Session steps ─────────────────────────────────────────────────────────────
export type USSDStep =
  | 'MAIN_MENU'
  | 'CASE_TYPE'
  | 'LABOUR_TYPE'
  | 'TRAFFICKING_TYPE'
  | 'CHILD_AGE'
  | 'CHILD_GENDER'
  | 'LOCATION'
  | 'DESCRIPTION'
  | 'ANONYMOUS_CHOICE'
  | 'CONFIRM_SUBMIT'
  | 'STATUS_QUERY'
  | 'EMERGENCY_CONFIRM';

// ── Draft accumulated during a session ────────────────────────────────────────
export interface USSDCaseDraft {
  caseType?: string;       // e.g. 'child_labour_fishing'
  childAge?: number;
  childGender?: 'male' | 'female' | 'unknown';
  location?: string;
  description?: string;
  isAnonymous?: boolean;
}

// ── Session record ─────────────────────────────────────────────────────────────
export interface USSDSession {
  sessionId: string;
  phone: string;           // E.164
  operator: string;
  step: USSDStep;
  draft: USSDCaseDraft;
  createdAt: number;       // Date.now() at creation
  updatedAt: number;
}

// ── Step result returned by each handler ──────────────────────────────────────
export type StepResult =
  | { type: 'CON'; text: string }   // continue — show menu, await input
  | { type: 'END'; text: string };  // end session — final message

// ── Provider-normalised incoming request ──────────────────────────────────────
export interface NormalisedUSSDRequest {
  sessionId: string;
  phone: string;           // E.164
  serviceCode: string;
  input: string;           // what the user typed (empty string on initiation)
  isNew: boolean;          // true = first dial, false = subsequent response
  operator?: string;
}

// ── Hubtel USSD webhook ───────────────────────────────────────────────────────
export interface HubtelUSSDRequest {
  SessionId: string;
  ServiceCode: string;
  Type: 'Initiation' | 'Response' | 'Release' | 'Timeout';
  Message: string;
  Mobile: string;
  Operator: string;
}

export interface HubtelUSSDResponse {
  Type: 'Response' | 'Release';
  Message: string;
}

// ── Africa's Talking USSD webhook ─────────────────────────────────────────────
// Body is application/x-www-form-urlencoded
export interface ATUSSDRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;            // full accumulated input, e.g. "1*2*10"
  networkCode?: string;
}

// Response is plain text: "CON <message>" or "END <message>"

export type USSDProvider = 'hubtel' | 'africastalking';
