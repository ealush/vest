import { CB, invariant, isFunction } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';

export function validateSuiteCallback<T extends CB>(
  suiteCallback: T,
): asserts suiteCallback is T {
  invariant(
    isFunction(suiteCallback),
    ErrorStrings.SUITE_MUST_BE_INITIALIZED_WITH_FUNCTION,
  );
}
