export function condition(
  value: any,
  callback: (value: any) => boolean,
): boolean {
  try {
    return callback(value);
  } catch {
    return false;
  }
}
