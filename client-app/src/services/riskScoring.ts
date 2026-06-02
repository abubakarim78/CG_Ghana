import { ReportDraft } from '../types/models';

export function computeRiskScore(draft: ReportDraft): number {
  let score = 0;

  // Case type weights
  if (draft.type === 'trafficking_labour' || draft.type === 'trafficking_sexual' || draft.type === 'trafficking_domestic') {
    score += 35;
  }
  if (draft.type === 'physical_abuse') {
    score += 25;
  }
  if (draft.type === 'child_labour_mining') {
    score += 20;
  }

  // Emergency flag
  if (draft.isEmergency) {
    score += 40;
  }

  // Child age weights
  if (draft.childAge !== undefined) {
    if (draft.childAge < 8) {
      score += 30;
    } else if (draft.childAge < 12) {
      score += 20;
    }
  }

  // Danger triage weights
  if (draft.dangerTriage.withPerp) {
    score += 25;
  }
  if (draft.dangerTriage.recentViolence) {
    score += 30;
  }
  if (draft.dangerTriage.noBasicNeeds) {
    score += 20;
  }

  return Math.min(100, score);
}

export function getRiskTierFromScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

export function shouldAutoEscalate(draft: ReportDraft): boolean {
  if (draft.isEmergency) return true;

  const triageYesCount = [
    draft.dangerTriage.withPerp,
    draft.dangerTriage.recentViolence,
    draft.dangerTriage.noBasicNeeds,
  ].filter(Boolean).length;

  return triageYesCount >= 2;
}
