export function isEven(value: number): boolean {
  return Number.isFinite(value) && value % 2 === 0;
}
