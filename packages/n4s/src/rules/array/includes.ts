// Checks if array contains the given item
export function includes<T>(arr: T[], item: T): boolean {
  return Array.isArray(arr) && arr.includes(item as any);
}
