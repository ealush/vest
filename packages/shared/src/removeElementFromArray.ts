/**
 * Removes first found element from array
 * WARNING: Mutates array
 */
export default function removeElementFromArray<T>(array: T[], element: T): T[] {
  const index = array.indexOf(element);
  if (index !== -1) {
    array.splice(index, 1);
  }

  return array;
}
