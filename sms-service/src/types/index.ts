export type CaseStatus =
  | 'submitted'
  | 'assigned'
  | 'investigating'
  | 'intervention'
  | 'resolved';

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export type OfficerRole =
  | 'social_worker'
  | 'police_dovvsu'
  | 'labour_inspector'
  | 'ngo_agent';

// ---------- Arkesel API ----------

export interface ArkeselSendPayload {
  sender: string;
  message: string;
  recipients: string[];
  sandbox?: boolean;
}

export interface ArkeselResponse {
  status: 'success' | 'error';
  data?: {
    recipients: Array<{
      number: string;
      status: string;
      id: string;
    }>;
  };
  message?: string;
}

export interface ArkeselIncomingWebhook {
  sender: string;      // phone number that sent the SMS
  message: string;     // raw SMS body
  date: string;        // ISO timestamp from Arkesel
  id: string;          // message ID
}

// ---------- Internal SMS types ----------

export interface SMSMessage {
  to: string | string[];   // E.164 Ghana numbers, e.g. +233241234567
  body: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  error?: string;
}

export interface BulkSMSResult {
  sent: SMSResult[];
  failed: SMSResult[];
  total: number;
}

// ---------- Domain event payloads ----------

export interface CaseUpdatePayload {
  caseId: string;
  status: CaseStatus;
  priority: CasePriority;
  district: string;
  region: string;
  reporterPhone?: string;   // present only when reporter is not anonymous
  officerPhone?: string;
  officerName?: string;
}

export interface EmergencyBroadcastPayload {
  caseId: string;
  district: string;
  region: string;
  description: string;
  officerPhones: string[];
}

export interface OfficerAssignPayload {
  caseId: string;
  officerPhone: string;
  officerName: string;
  caseType: string;
  district: string;
  priority: CasePriority;
}

// ---------- Incoming SMS command ----------

export type IncomingCommand = 'STATUS' | 'HELP' | 'STOP' | 'UNKNOWN';

export interface ParsedIncomingSMS {
  command: IncomingCommand;
  args: string[];
  rawMessage: string;
  senderPhone: string;
}
