export function shorterThan(
  value: string | unknown[],
  arg1: string | number
): boolean {
  return value.length < Number(arg1);
}
