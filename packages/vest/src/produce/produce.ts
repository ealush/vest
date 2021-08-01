import assign from 'assign';
import createCache from 'cache';
import isFunction from 'isFunction';

import ctx from 'ctx';
import hasRemainingTests from 'hasRemainingTests';
import { produceDraft, TDraftResult } from 'produceDraft';
import { useStateRef, useTestCallbacks, useTestsOrdered } from 'stateHooks';

const cache = createCache(20);

export function produceFullResult(): IVestResult {
  const [testObjects] = useTestsOrdered();
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

  const stateRef = useStateRef();

  const output = produceFullResult();

  if (shouldSkipDoneRegistration(callback, fieldName, output)) {
    return output;
  }

  const deferredCallback = ctx.bind({ stateRef }, () =>
    callback(produceDraft())
  );

  if (shouldRunDoneCallback(fieldName)) {
    deferredCallback();
    return output;
  }

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

  return output;
};

export type IVestResult = TDraftResult & { done: IDone };

interface IDone {
  (...args: [cb: (res: TDraftResult) => void]): IVestResult;
  (...args: [fieldName: string, cb: (res: TDraftResult) => void]): IVestResult;
}
