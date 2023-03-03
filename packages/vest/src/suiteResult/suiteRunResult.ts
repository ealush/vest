import { assign } from 'vest-utils';

import { persist } from 'PersistedContext';
import { SuiteResult, SuiteRunResult, TFieldName } from 'SuiteResultTypes';
import { TestWalker } from 'TestWalker';
import { useDeferDoneCallback } from 'deferDoneCallback';
import { shouldSkipDoneRegistration } from 'shouldSkipDoneRegistration';
import { useCreateSuiteResult } from 'suiteResult';

export function useSuiteRunResult<F extends TFieldName>(): SuiteRunResult<F> {
  return assign({}, useCreateSuiteResult(), {
    done: persist(done),
  });
}

/**
 * Registers done callbacks.
 * @register {Object} Vest output object.
 */
// @vx-allow use-use
function done<F extends TFieldName>(...args: any[]): SuiteRunResult<F> {
  const [callback, fieldName] = args.reverse() as [
    (res: SuiteResult<F>) => void,
    string
  ];
  const output = useSuiteRunResult();
  if (shouldSkipDoneRegistration(callback, fieldName, output)) {
    return output;
  }
  const useDoneCallback = () => callback(useCreateSuiteResult());
  if (!TestWalker.hasRemainingTests(fieldName)) {
    useDoneCallback();
    return output;
  }
  useDeferDoneCallback(useDoneCallback, fieldName);
  return output;
}

export interface Done<F extends TFieldName> {
  (...args: [cb: (res: SuiteResult<F>) => void]): SuiteRunResult<F>;
  (
    ...args: [fieldName: F, cb: (res: SuiteResult<F>) => void]
  ): SuiteRunResult<F>;
}
