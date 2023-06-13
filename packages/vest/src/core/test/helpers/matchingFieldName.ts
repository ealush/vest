import { Maybe } from 'vest-utils';

import { TFieldName } from 'SuiteResultTypes';
import { WithFieldName } from 'TestTypes';

export function nonMatchingFieldName(
  WithFieldName: WithFieldName<TFieldName>,
  fieldName?: Maybe<TFieldName>
): boolean {
  return !!fieldName && !matchingFieldName(WithFieldName, fieldName);
}

export default function matchingFieldName(
  WithFieldName: WithFieldName<TFieldName>,
  fieldName?: Maybe<TFieldName>
): boolean {
  return !!(fieldName && WithFieldName.fieldName === fieldName);
}
