import { IsolateTypes } from 'IsolateTypes';
import { createVestState, PersistedContext } from 'PersistedContext';
import { SuiteContext } from 'SuiteContext';
import { SuiteResult, SuiteRunResult } from 'SuiteResultTypes';
import { TestWalker } from 'SuiteWalker';
import { isolate } from 'isolate';
import { suiteResult } from 'suiteResult';
import { suiteRunResult } from 'suiteRunResult';
import { assign, CB, invariant, isFunction } from 'vest-utils';

function createSuite<T extends CB>(
  suiteName: SuiteName,
  suiteCallback: T
): Suite<T>;
function createSuite<T extends CB>(suiteCallback: T): Suite<T>;
function createSuite<T extends CB>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite<T> {
  const [suiteCallback, suiteName] = args.reverse() as [T, SuiteName];

  invariant(
    isFunction(suiteCallback),
    'vest.create: Expected callback to be a function.'
  );

  const { state, stateRef } = createVestState({ suiteName });

  const suite = PersistedContext.bind(
    stateRef,
    function suite(...args: Parameters<T>): SuiteRunResult {
      const [, output] = SuiteContext.run({}, () => {
        // eslint-disable-next-line max-nested-callbacks
        return isolate(IsolateTypes.SUITE, () => {
          suiteCallback(...args);
          return suiteRunResult();
        });
      });

      return output;
    }
  );

  return assign(suite, {
    get: PersistedContext.bind(stateRef, suiteResult),
    reset: state.reset,
    remove: PersistedContext.bind(stateRef, TestWalker.removeTestByFieldName),
  });
}

export type SuiteName = string | undefined;

export type Suite<T extends CB> = ((...args: Parameters<T>) => SuiteRunResult) &
  SuiteMethods;

type SuiteMethods = {
  get: () => SuiteResult;
  reset: () => void;
  remove: (fieldName: string) => void;
};

export { createSuite };
