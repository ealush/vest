import invariant from 'invariant';
import isFunction from 'isFunction';

import { SuiteResult } from 'produceSuiteResult';
import { SuiteRunResult } from 'produceSuiteRunResult';

const promisify =
  (validatorFn: (...args: any[]) => SuiteRunResult) =>
  (...args: any[]): Promise<SuiteResult> => {
    invariant(
      isFunction(validatorFn),
      'promisify: Expected validatorFn to be a function.'
    );

    return new Promise(resolve => validatorFn(...args).done(resolve));
  };

export default promisify;
