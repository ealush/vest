// TODO: IMPLEMENT

export function shouldAddValidProperty(fieldName: string): boolean {
  return !!fieldName;
}

export function shouldAddValidPropertyInGroup(
  group: string,
  fieldName: string
): boolean {
  return !!group && !!fieldName;
}
