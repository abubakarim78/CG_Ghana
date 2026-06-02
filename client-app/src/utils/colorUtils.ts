import { COLORS } from '../theme/colors';
import { CaseStatus, CasePriority } from '../types/models';

export function getStatusColor(status: CaseStatus): string {
  return COLORS.status[status];
}

export function getPriorityColor(priority: CasePriority): string {
  return COLORS.priority[priority];
}

export function getRiskTier(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

export function getRiskColor(score: number): string {
  const tier = getRiskTier(score);
  return COLORS.risk[tier];
}

export function getRiskLabel(score: number): string {
  const tier = getRiskTier(score);
  const labels: Record<'low' | 'medium' | 'high' | 'critical', string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  };
  return labels[tier];
}

export function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
