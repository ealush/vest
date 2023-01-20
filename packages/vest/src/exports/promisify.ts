import { invariant, isFunction } from 'vest-utils';

import { SuiteResult, SuiteRunResult, TFieldName } from 'SuiteResultTypes';

function promisify<F extends TFieldName>(
  validatorFn: (...args: any[]) => SuiteRunResult<F>
) {
  return (...args: any[]): Promise<SuiteResult<F>> => {
    invariant(
      isFunction(validatorFn),
      'promisify: Expected validatorFn to be a function.'
    );

    return new Promise(resolve => validatorFn(...args).done(resolve));
  };
}

export default promisify;
