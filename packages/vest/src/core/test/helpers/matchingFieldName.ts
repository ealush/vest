import { Maybe, isNotNullish, makeResult, Result } from 'vest-utils';

import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import { WithFieldName } from '../TestTypes';

export function nonMatchingFieldName(
  WithFieldName: WithFieldName<TFieldName>,
  fieldName?: Maybe<TFieldName>,
): Result<boolean> {
  return makeResult.Ok(
    !!fieldName && !matchingFieldName(WithFieldName, fieldName).unwrap(),
  );
}

export default function matchingFieldName(
  WithFieldName: WithFieldName<TFieldName>,
  fieldName?: Maybe<TFieldName>,
): Result<boolean> {
  // An empty string is a valid field name (a form-level test), so only a
  // missing field name is treated as "no match".
  return makeResult.Ok(
    isNotNullish(fieldName) && WithFieldName.fieldName === fieldName,
  );
}
