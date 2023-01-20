import { TFieldName } from 'SuiteResultTypes';
import { VestTest } from 'VestTest';

export function nonMatchingFieldName(
  testObject: VestTest,
  fieldName?: TFieldName | void
): boolean {
  return !!fieldName && !matchingFieldName(testObject, fieldName);
}

export default function matchingFieldName(
  testObject: VestTest,
  fieldName?: TFieldName | void
): boolean {
  return !!(fieldName && testObject.fieldName === fieldName);
}
