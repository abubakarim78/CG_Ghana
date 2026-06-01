import type {
  CaseUpdatePayload,
  EmergencyBroadcastPayload,
  OfficerAssignPayload,
  CaseStatus,
} from '../types';

// All messages kept under 160 chars where possible to avoid multi-part billing.

const STATUS_LABELS: Record<CaseStatus, string> = {
  submitted: 'Received & Under Review',
  assigned: 'Officer Assigned',
  investigating: 'Investigation Underway',
  intervention: 'Intervention In Progress',
  resolved: 'Case Resolved',
};

export function caseUpdateReporterSMS(payload: CaseUpdatePayload): string {
  const label = STATUS_LABELS[payload.status];
  if (payload.status === 'resolved') {
    return (
      `ChildGuard Update - Case ${payload.caseId}: RESOLVED. ` +
      `Thank you for reporting. Together we protect children in Ghana. ` +
      `Reply HELP for support.`
    );
  }
  return (
    `ChildGuard Update - Case ${payload.caseId}: ${label}. ` +
    `District: ${payload.district}. ` +
    `We will keep you informed. Reply STOP to opt out.`
  );
}

export function caseUpdateOfficerSMS(payload: CaseUpdatePayload): string {
  const label = STATUS_LABELS[payload.status];
  return (
    `[ChildGuard] Case ${payload.caseId} status: ${label}. ` +
    `Priority: ${payload.priority.toUpperCase()}. ` +
    `District: ${payload.district}, ${payload.region}.`
  );
}

export function officerAssignSMS(payload: OfficerAssignPayload): string {
  const typeLabel = payload.caseType.replace(/_/g, ' ');
  return (
    `[ChildGuard] ${payload.officerName}, you have been assigned Case ${payload.caseId}. ` +
    `Type: ${typeLabel}. Priority: ${payload.priority.toUpperCase()}. ` +
    `District: ${payload.district}. Log in to review details.`
  );
}

export function emergencyBroadcastSMS(payload: EmergencyBroadcastPayload): string {
  const shortDesc =
    payload.description.length > 80
      ? payload.description.slice(0, 77) + '...'
      : payload.description;
  return (
    `[EMERGENCY - ChildGuard] Case ${payload.caseId} in ${payload.district}, ${payload.region}. ` +
    `${shortDesc} Immediate response required. Log in now.`
  );
}

export function statusQueryReplySMS(caseId: string, status: CaseStatus, district: string): string {
  const label = STATUS_LABELS[status];
  return `ChildGuard: Case ${caseId} - ${label} (${district}). Reply HELP for assistance.`;
}

export function caseNotFoundReplySMS(caseId: string): string {
  return `ChildGuard: Case ID "${caseId}" not found. Please check the ID and try again or call 080010400.`;
}

export function helpReplySMS(): string {
  return (
    `ChildGuard Help: To check a case, SMS: STATUS <caseID>. ` +
    `Hotline: 080010400 (free, 24/7). ` +
    `Reply STOP to unsubscribe from updates.`
  );
}

export function optOutConfirmationSMS(): string {
  return `ChildGuard: You have been unsubscribed from SMS updates. SMS START to re-subscribe.`;
}

export function optInConfirmationSMS(): string {
  return `ChildGuard: You are now subscribed to case updates. Reply HELP for assistance.`;
}
