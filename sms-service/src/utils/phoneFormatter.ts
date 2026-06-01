/**
 * Normalises a Ghanaian phone number to E.164 (+233XXXXXXXXX).
 * Accepts:
 *   0241234567  →  +233241234567
 *   233241234567 → +233241234567
 *   +233241234567 (already E.164, returned as-is)
 */
export function formatGhanaPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');

  if (digits.startsWith('233') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `+233${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+233${digits}`;
  }

  // Already has leading +
  if (raw.startsWith('+') && digits.length === 12) {
    return `+${digits}`;
  }

  throw new Error(`Cannot parse Ghana phone number: "${raw}"`);
}

export function formatMany(numbers: string[]): string[] {
  return numbers.map(formatGhanaPhone);
}

export function isValidGhanaPhone(raw: string): boolean {
  try {
    formatGhanaPhone(raw);
    return true;
  } catch {
    return false;
  }
}
