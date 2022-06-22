import { isEmpty, assign, isFunction, cache as createCache } from 'vest-utils';

import ctx from 'ctx';
import hasRemainingTests from 'hasRemainingTests';
import { produceSuiteResult, SuiteResult } from 'produceSuiteResult';
import { useStateRef, useTestCallbacks, useTestsFlat } from 'stateHooks';

const cache = createCache(20);

export function produceFullResult(): SuiteRunResult {
  const testObjects = useTestsFlat();
  const ctxRef = { stateRef: useStateRef() };
  return cache(
    [testObjects],
    ctx.bind(ctxRef, () =>
      assign({}, produceSuiteResult(), {
        done: ctx.bind(ctxRef, done),
      })
    )
  );
}

/**
 * DONE is here and not in its own module to prevent circular dependency issues.
 */

function shouldSkipDoneRegistration(
  callback: (res: SuiteResult) => void,

  fieldName: string | undefined,
  output: SuiteRunResult
): boolean {
  // If we do not have any test runs for the current field
  return !!(
    !isFunction(callback) ||
    (fieldName &&
      (!output.tests[fieldName] || isEmpty(output.tests[fieldName].testCount)))
  );
}

function shouldRunDoneCallback(fieldName?: string): boolean {
  // is suite finished || field name exists, and test is finished;

  return !!(
    !hasRemainingTests() ||
    (fieldName && !hasRemainingTests(fieldName))
  );
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

  const output = produceFullResult();

  if (shouldSkipDoneRegistration(callback, fieldName, output)) {
    return output;
  }

  const doneCallback = () => callback(produceSuiteResult());

  if (shouldRunDoneCallback(fieldName)) {
    doneCallback();
    return output;
  }

  deferDoneCallback(doneCallback, fieldName);

  return output;
};

function deferDoneCallback(doneCallback: () => void, fieldName?: string): void {
  const [, setTestCallbacks] = useTestCallbacks();
  setTestCallbacks(current => {
    if (fieldName) {
      current.fieldCallbacks[fieldName] = (
        current.fieldCallbacks[fieldName] || []
      ).concat(doneCallback);
    } else {
      current.doneCallbacks.push(doneCallback);
    }
    return current;
  });
}

export type SuiteRunResult = SuiteResult & { done: Done };

interface Done {
  (...args: [cb: (res: SuiteResult) => void]): SuiteRunResult;
  (
    ...args: [fieldName: string, cb: (res: SuiteResult) => void]
  ): SuiteRunResult;
}
