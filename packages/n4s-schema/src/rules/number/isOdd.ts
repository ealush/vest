export function isOdd(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value % 2) === 1;
}
