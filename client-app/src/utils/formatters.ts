import { CaseStatus, CasePriority, CaseType } from '../types/models';

export function formatCaseId(num: number): string {
  return 'CG-' + String(num).padStart(5, '0');
}

export function parseCaseId(id: string): number {
  return parseInt(id.replace('CG-', ''), 10);
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHour < 24) {
    return `${diffHour}h ago`;
  } else if (diffDay < 30) {
    return `${diffDay}d ago`;
  } else {
    return formatDate(iso);
  }
}

export function getStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    submitted: 'Submitted',
    assigned: 'Assigned',
    investigating: 'Investigating',
    intervention: 'Intervention',
    resolved: 'Resolved',
  };
  return labels[status];
}

export function getPriorityLabel(priority: CasePriority): string {
  const labels: Record<CasePriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  return labels[priority];
}

export function getCaseTypeLabel(type: CaseType): string {
  const labels: Record<CaseType, string> = {
    child_labour_agriculture: 'Child Labour — Agriculture',
    child_labour_fishing: 'Child Labour — Fishing',
    child_labour_mining: 'Child Labour — Mining',
    child_labour_domestic: 'Child Labour — Domestic Work',
    child_labour_manufacturing: 'Child Labour — Manufacturing',
    child_labour_street: 'Child Labour — Street Work',
    trafficking_labour: 'Human Trafficking — Labour',
    trafficking_sexual: 'Human Trafficking — Sexual Exploitation',
    trafficking_domestic: 'Human Trafficking — Domestic Servitude',
    neglect: 'Child Neglect',
    early_marriage: 'Early / Forced Marriage',
    physical_abuse: 'Physical Abuse',
  };
  return labels[type];
}

export function getCaseTypeShortLabel(type: CaseType): string {
  const labels: Record<CaseType, string> = {
    child_labour_agriculture: 'Agri Labour',
    child_labour_fishing: 'Fishing Labour',
    child_labour_mining: 'Mining Labour',
    child_labour_domestic: 'Domestic Labour',
    child_labour_manufacturing: 'Mfg Labour',
    child_labour_street: 'Street Labour',
    trafficking_labour: 'Labour Trafficking',
    trafficking_sexual: 'Sexual Trafficking',
    trafficking_domestic: 'Domestic Trafficking',
    neglect: 'Neglect',
    early_marriage: 'Early Marriage',
    physical_abuse: 'Physical Abuse',
  };
  return labels[type];
}
