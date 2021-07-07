export function longerThan(
  value: string | unknown[],
  arg1: string | number
): boolean {
  return value.length > Number(arg1);
}
