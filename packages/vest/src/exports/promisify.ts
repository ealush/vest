import isFunction from 'isFunction';
import throwError from 'throwError';

import { IVestResult } from 'produce';
import { TDraftResult } from 'produceDraft';

const promisify =
  (validatorFn: (...args: any[]) => IVestResult) =>
  (...args: any[]): Promise<TDraftResult> => {
    if (!isFunction(validatorFn)) {
      throwError('promisify: Expected validatorFn to be a function.');
    }

    return new Promise(resolve => validatorFn(...args).done(resolve));
  };

export default promisify;
