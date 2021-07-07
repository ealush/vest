export function shorterThanOrEquals(
  value: string | unknown[],
  arg1: string | number
): boolean {
  return value.length <= Number(arg1);
}
