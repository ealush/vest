// Validates that two values are not strictly equal (!==)
export function notEquals<T>(value: T, v: T): boolean {
  return value !== v;
}
