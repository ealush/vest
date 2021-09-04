import VestTest from 'VestTest';

export function nonMatchingFieldName(
  testObject: VestTest,
  fieldName?: string | void
): boolean {
  return !!fieldName && !matchingFieldName(testObject, fieldName);
}

export default function matchingFieldName(
  testObject: VestTest,
  fieldName?: string | void
): boolean {
  return !!(fieldName && testObject.fieldName === fieldName);
}
