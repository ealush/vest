// Validates that a value is falsy (false, 0, '', null, undefined, or NaN)
export function isFalsy(value: any): boolean {
  return !value;
}
