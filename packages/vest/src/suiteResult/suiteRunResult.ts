import { assign } from 'vest-utils';

import { persist } from 'PersistedContext';
import { SuiteResult, SuiteRunResult, TFieldName } from 'SuiteResultTypes';
import { TestWalker } from 'SuiteWalker';
import { deferDoneCallback } from 'deferDoneCallback';
import { shouldSkipDoneRegistration } from 'shouldSkipDoneRegistration';
import { createSuiteResult } from 'suiteResult';

export function suiteRunResult<F extends TFieldName>(): SuiteRunResult<F> {
  return assign({}, createSuiteResult(), {
    done: persist(done),
  });
}

/**
 * Registers done callbacks.
 * @register {Object} Vest output object.
 */
function done<F extends TFieldName>(...args: any[]): SuiteRunResult<F> {
  const [callback, fieldName] = args.reverse() as [
    (res: SuiteResult<F>) => void,
    string
  ];
  const output = suiteRunResult();
  if (shouldSkipDoneRegistration(callback, fieldName, output)) {
    return output;
  }
  const doneCallback = () => callback(createSuiteResult());
  if (!TestWalker.hasRemainingTests(fieldName)) {
    doneCallback();
    return output;
  }
  deferDoneCallback(doneCallback, fieldName);
  return output;
}

export interface Done<F extends TFieldName> {
  (...args: [cb: (res: SuiteResult<F>) => void]): SuiteRunResult<F>;
  (
    ...args: [fieldName: F, cb: (res: SuiteResult<F>) => void]
  ): SuiteRunResult<F>;
}
