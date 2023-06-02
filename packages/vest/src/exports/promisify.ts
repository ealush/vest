import { ErrorStrings } from 'ErrorStrings';
import { invariant, isFunction } from 'vest-utils';

import {
  SuiteResult,
  SuiteRunResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';

function promisify<F extends TFieldName, G extends TGroupName>(
  validatorFn: (...args: any[]) => SuiteRunResult<F, G>
) {
  return (...args: any[]): Promise<SuiteResult<F, G>> => {
    invariant(isFunction(validatorFn), ErrorStrings.PROMISIFY_REQUIRE_FUNCTION);

    return new Promise(resolve => validatorFn(...args).done(resolve));
  };
}

export default promisify;
