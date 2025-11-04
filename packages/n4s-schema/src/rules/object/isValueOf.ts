export function isValueOf<T = any>(value: T, obj: Record<string, T>): boolean {
  return (
    obj != null && typeof obj === 'object' && Object.values(obj).includes(value)
  );
}

export function isNotValueOf<T = any>(
  value: T,
  obj: Record<string, T>,
): boolean {
  return (
    obj != null &&
    typeof obj === 'object' &&
    !Object.values(obj).includes(value)
  );
}
