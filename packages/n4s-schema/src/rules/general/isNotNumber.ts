export function isNotNumber(value: any): boolean {
  return typeof value !== 'number' || Number.isNaN(value);
}
