import { invariant, isFunction } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import {
  SuiteResult,
  SuiteResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';

function promisify<F extends TFieldName, G extends TGroupName>(
  validatorFn: (...args: any[]) => SuiteResult<F, G>,
) {
  return (...args: any[]): Promise<SuiteResult<F, G>> => {
    invariant(isFunction(validatorFn), ErrorStrings.PROMISIFY_REQUIRE_FUNCTION);

    return new Promise(resolve => validatorFn(...args).after(resolve));
  };
}

export default promisify;
