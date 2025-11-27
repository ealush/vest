import { Maybe, makeResult, Result } from 'vest-utils';

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
  return makeResult.Ok(!!(fieldName && WithFieldName.fieldName === fieldName));
}

export function matchesOrHasNoFieldName(
  WithFieldName: WithFieldName<TFieldName>,
  fieldName?: Maybe<TFieldName>,
): Result<boolean> {
  if (fieldName) {
    return matchingFieldName(WithFieldName, fieldName);
  }
  return makeResult.Ok(true);
}
