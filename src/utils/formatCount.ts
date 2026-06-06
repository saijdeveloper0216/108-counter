/** Full total for the jaap bar — Indian grouping (e.g. 1,00,00,000). */
export function formatJaapTotalBar(value: number): string {
  return Math.max(0, Math.floor(value)).toLocaleString('en-IN');
}

/** Compact display for large jaap totals elsewhere (e.g. 1.2M). */
export function formatJaapCount(value: number): string {
  if (value < 10_000) {
    return value.toLocaleString('en-US');
  }
  if (value < 1_000_000) {
    const rounded = value / 1000;
    const text = rounded >= 100 ? Math.round(rounded).toString() : rounded.toFixed(1).replace(/\.0$/, '');
    return `${text}K`;
  }
  const rounded = value / 1_000_000;
  const text = rounded >= 100 ? Math.round(rounded).toString() : rounded.toFixed(1).replace(/\.0$/, '');
  return `${text}M`;
}

/** Font size for the full-width jaap total bar. */
export function jaapTotalBarFontSize(totalCount: number): number {
  const len = formatJaapTotalBar(totalCount).length;
  if (len <= 4) {
    return 36;
  }
  if (len <= 6) {
    return 32;
  }
  if (len <= 8) {
    return 28;
  }
  if (len <= 11) {
    return 24;
  }
  return 20;
}
