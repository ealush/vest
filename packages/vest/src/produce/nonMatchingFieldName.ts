import VestTest from 'VestTest';

export default function nonMatchingFieldName(
  testObject: VestTest,
  fieldName?: string | void
): boolean {
  return !!(fieldName && testObject.fieldName !== fieldName);
}
