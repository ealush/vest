import { invariant, isFunction } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import { SuiteResult, SuiteRunResult, TFieldName } from 'SuiteResultTypes';

function promisify<F extends TFieldName>(
  validatorFn: (...args: any[]) => SuiteRunResult<F>
) {
  return (...args: any[]): Promise<SuiteResult<F>> => {
    invariant(isFunction(validatorFn), ErrorStrings.PROMISIFY_REQUIRE_FUNCTION);

    return new Promise(resolve => validatorFn(...args).done(resolve));
  };
}

export default promisify;
