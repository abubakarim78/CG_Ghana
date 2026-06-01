import { CasePriority, CaseType } from '@prisma/client';

interface TriageFlags {
  withPerp: boolean;
  recentViolence: boolean;
  noBasicNeeds: boolean;
  isEmergency: boolean;
}

const HIGH_RISK_TYPES = new Set<CaseType>([
  'trafficking_sexual',
  'trafficking_labour',
  'trafficking_domestic',
  'physical_abuse',
]);

const MEDIUM_RISK_TYPES = new Set<CaseType>([
  'child_labour_mining',
  'child_labour_fishing',
  'early_marriage',
]);

export function computeRiskScore(
  type: CaseType,
  childAge: number,
  triage: TriageFlags
): { score: number; priority: CasePriority } {
  let score = 0;

  if (HIGH_RISK_TYPES.has(type)) score += 40;
  else if (MEDIUM_RISK_TYPES.has(type)) score += 25;
  else score += 10;

  if (childAge < 6) score += 30;
  else if (childAge < 12) score += 20;
  else if (childAge < 15) score += 10;

  if (triage.withPerp) score += 15;
  if (triage.recentViolence) score += 15;
  if (triage.noBasicNeeds) score += 10;
  if (triage.isEmergency) score += 10;

  const capped = Math.min(score, 100);

  let priority: CasePriority;
  if (capped >= 75) priority = 'critical';
  else if (capped >= 50) priority = 'high';
  else if (capped >= 25) priority = 'medium';
  else priority = 'low';

  return { score: capped, priority };
}
