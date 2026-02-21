/**
 * Checks if a given set is empty.
 * @param value value to check
 */
export function isEmptySet(value: Set<unknown>): boolean {
  return value.size === 0;
}

/**
 * Checks if a given set is NOT empty.
 * @param value value to check
 */
export function isNotEmptySet(value: Set<unknown>): boolean {
  return value.size > 0;
}
