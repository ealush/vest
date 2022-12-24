import { assign } from 'vest-utils';

import { persist } from 'PersistedContext';
import { Done, SuiteResult, SuiteRunResult } from 'SuiteResultTypes';
import { TestWalker } from 'SuiteWalker';
import { deferDoneCallback } from 'deferDoneCallback';
import { shouldSkipDoneRegistration } from 'shouldSkipDoneRegistration';
import { suiteResult } from 'suiteResult';

export function suiteRunResult(): SuiteRunResult {
  return assign({}, suiteResult(), {
    done: persist(done),
  });
}

/**
 * Registers done callbacks.
 * @register {Object} Vest output object.
 */
const done: Done = function done(...args): SuiteRunResult {
  const [callback, fieldName] = args.reverse() as [
    (res: SuiteResult) => void,
    string
  ];

  const output = suiteRunResult();

  if (shouldSkipDoneRegistration(callback, fieldName, output)) {
    return output;
  }

  const doneCallback = () => callback(suiteResult());

  if (!TestWalker.hasRemainingTests(fieldName)) {
    doneCallback();
    return output;
  }

  deferDoneCallback(doneCallback, fieldName);

  return output;
};
