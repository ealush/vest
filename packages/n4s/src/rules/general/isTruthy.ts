// Validates that a value is truthy (not false, 0, '', null, undefined, or NaN)
export function isTruthy(value: any): boolean {
  return !!value;
}
