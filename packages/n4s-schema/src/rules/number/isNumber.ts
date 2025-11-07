export function isNumber(value: any): boolean {
  return typeof value === 'number' && !Number.isNaN(value);
}
