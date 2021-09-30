export default function getFailuresArrayOrObject(
  group: Record<string, string[]>,
  fieldName?: string
): string[] | Record<string, string[]> {
  if (fieldName) {
    return group[fieldName];
  }

  return group;
}
