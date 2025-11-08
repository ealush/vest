// Runs custom validation function, returns false if callback throws
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
