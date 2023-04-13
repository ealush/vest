import { assign } from 'vest-utils';

import { persist } from 'PersistedContext';
import {
  SuiteResult,
  SuiteRunResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { TestWalker } from 'TestWalker';
import { useDeferDoneCallback } from 'deferDoneCallback';
import { shouldSkipDoneRegistration } from 'shouldSkipDoneRegistration';
import { useCreateSuiteResult } from 'suiteResult';

export function useSuiteRunResult<
  F extends TFieldName,
  G extends TGroupName
>(): SuiteRunResult<F, G> {
  return assign({}, useCreateSuiteResult(), {
    done: persist(done),
  });
}

/**
 * Registers done callbacks.
 * @register {Object} Vest output object.
 */
// @vx-allow use-use
function done<F extends TFieldName, G extends TGroupName>(
  ...args: any[]
): SuiteRunResult<F, G> {
  const [callback, fieldName] = args.reverse() as [
    (res: SuiteResult<F, G>) => void,
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

export interface Done<F extends TFieldName, G extends TGroupName> {
  (...args: [cb: (res: SuiteResult<F, G>) => void]): SuiteRunResult<F, G>;
  (
    ...args: [fieldName: F, cb: (res: SuiteResult<F, G>) => void]
  ): SuiteRunResult<F, G>;
}
