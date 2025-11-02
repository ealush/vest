export function isValueOf<T = any>(
  obj: Record<string, T>,
): (value: T) => boolean {
  return (value: T) =>
    obj != null &&
    typeof obj === 'object' &&
    Object.values(obj).includes(value);
}

export function isNotValueOf<T = any>(
  obj: Record<string, T>,
): (value: T) => boolean {
  return (value: T) =>
    obj != null &&
    typeof obj === 'object' &&
    !Object.values(obj).includes(value);
}
