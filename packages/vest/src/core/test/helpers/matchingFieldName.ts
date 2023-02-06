import { IsolateTest } from 'IsolateTest';
import { TFieldName } from 'SuiteResultTypes';

export function nonMatchingFieldName(
  testObject: IsolateTest,
  fieldName?: TFieldName | void
): boolean {
  return !!fieldName && !matchingFieldName(testObject, fieldName);
}

export default function matchingFieldName(
  testObject: IsolateTest,
  fieldName?: TFieldName | void
): boolean {
  return !!(fieldName && testObject.fieldName === fieldName);
}
