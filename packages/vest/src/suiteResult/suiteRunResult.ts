import { SuiteWalker } from 'SuiteWalker';
import { assign } from 'vest-utils';
import { VestRuntime } from 'vestjs-runtime';

import {
  SuiteResult,
  SuiteRunResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { useDeferDoneCallback } from 'deferDoneCallback';
import { shouldSkipDoneRegistration } from 'shouldSkipDoneRegistration';
import { useCreateSuiteResult } from 'suiteResult';

export function useSuiteRunResult<
  F extends TFieldName,
  G extends TGroupName
>(): SuiteRunResult<F, G> {
  return Object.freeze(
    assign(
      {
        done: VestRuntime.persist(done),
      },
      useCreateSuiteResult<F, G>()
    )
  );
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
    F
  ];
  const output = useSuiteRunResult<F, G>();
  if (shouldSkipDoneRegistration<F, G>(callback, fieldName, output)) {
    return output;
  }
  const useDoneCallback = () => callback(useCreateSuiteResult());
  if (!SuiteWalker.hasRemainingTests(fieldName)) {
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
