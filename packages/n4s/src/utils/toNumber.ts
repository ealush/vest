// Shared utility for converting values to numbers across rules
export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return value;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}
