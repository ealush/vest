import assign from 'assign';
import createCache from 'cache';
import isFunction from 'isFunction';

import ctx from 'ctx';
import hasRemainingTests from 'hasRemainingTests';
import { produceDraft, TDraftResult } from 'produceDraft';
import { useStateRef, useTestCallbacks, useTestsFlat } from 'stateHooks';

const cache = createCache(20);

export function produceFullResult(): IVestResult {
  const testObjects = useTestsFlat();
  const ctxRef = { stateRef: useStateRef() };
  return cache(
    [testObjects],
    ctx.bind(ctxRef, () =>
      assign({}, produceDraft(), {
        done: ctx.bind(ctxRef, done),
      })
    )
  );
}

/**
 * DONE is here and not in its own module to prevent circular dependency issues.
 */

function shouldSkipDoneRegistration(
  callback: (res: TDraftResult) => void,

  fieldName: string | undefined,
  output: IVestResult
): boolean {
  // If we do not have any test runs for the current field
  return !!(
    !isFunction(callback) ||
    (fieldName &&
      (!output.tests[fieldName] || output.tests[fieldName].testCount === 0))
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
const done: IDone = function done(...args): IVestResult {
  const [callback, fieldName] = args.reverse() as [
    (res: TDraftResult) => void,
    string
  ];

  const output = produceFullResult();

  if (shouldSkipDoneRegistration(callback, fieldName, output)) {
    return output;
  }

  const doneCallback = () => callback(produceDraft());

  if (shouldRunDoneCallback(fieldName)) {
    doneCallback();
    return output;
  }

  deferDoneCallback(doneCallback, fieldName);

  return output;
};

function deferDoneCallback(doneCallback: () => void, fieldName?: string): void {
  const deferredCallback = ctx.bind({}, doneCallback);
  const [, setTestCallbacks] = useTestCallbacks();
  setTestCallbacks(current => {
    if (fieldName) {
      current.fieldCallbacks[fieldName] = (
        current.fieldCallbacks[fieldName] || []
      ).concat(deferredCallback);
    } else {
      current.doneCallbacks.push(deferredCallback);
    }
    return current;
  });
}

export type IVestResult = TDraftResult & { done: IDone };

interface IDone {
  (...args: [cb: (res: TDraftResult) => void]): IVestResult;
  (...args: [fieldName: string, cb: (res: TDraftResult) => void]): IVestResult;
}
