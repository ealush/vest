import isFunction from 'isFunction';
import throwError from 'throwError';

import { SuiteResult } from 'produceSuiteResult';
import { SuiteRunResult } from 'produceSuiteRunResult';

const promisify =
  (validatorFn: (...args: any[]) => SuiteRunResult) =>
  (...args: any[]): Promise<SuiteResult> => {
    if (!isFunction(validatorFn)) {
      throwError('promisify: Expected validatorFn to be a function.');
    }

    return new Promise(resolve => validatorFn(...args).done(resolve));
  };

export default promisify;
