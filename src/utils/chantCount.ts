/** Exact decimal counting, including values beyond JavaScript's safe integer range.
 * Only tiny digit/remainder arithmetic uses Number. Saved totals remain strings.
 */
export function normalizeChantCount(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && Number.isSafeInteger(Math.floor(value))) return String(Math.floor(value));
  return typeof value === 'string' && /^\d+$/.test(value) ? value.replace(/^0+(?=\d)/, '') : '0';
}

export function incrementChantCount(value: string): string {
  const digits = value.split('');
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] !== '9') { digits[i] = String(Number(digits[i]) + 1); return digits.join(''); }
    digits[i] = '0';
  }
  return '1' + digits.join('');
}

export function decrementChantCount(value: string): string {
  if (value === '0') return value;
  const digits = value.split('');
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] !== '0') { digits[i] = String(Number(digits[i]) - 1); break; }
    digits[i] = '9';
  }
  return normalizeChantCount(digits.join(''));
}

export function divideChantCount(value: string, divisor: number): { quotient: string; remainder: number } {
  let remainder = 0;
  let quotient = '';
  for (const digit of value) {
    const partial = remainder * 10 + Number(digit);
    quotient += String(Math.floor(partial / divisor));
    remainder = partial % divisor;
  }
  return { quotient: normalizeChantCount(quotient), remainder };
}

export function formatChantCount(value: string): string {
  const groups: string[] = [];
  for (let end = value.length; end > 0; end -= 3) groups.unshift(value.slice(Math.max(0, end - 3), end));
  return groups.join(',');
}
