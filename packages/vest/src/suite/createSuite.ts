import { assign, CB, invariant, isFunction } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import {
  createVestState,
  persist,
  PersistedContext,
  useEmit,
} from 'PersistedContext';
import { SuiteContext } from 'SuiteContext';
import { SuiteResult, SuiteRunResult } from 'SuiteResultTypes';
import { TestWalker } from 'SuiteWalker';
import { Events } from 'VestBus';
import { isolate } from 'isolate';
import { suiteResult } from 'suiteResult';
import { suiteRunResult } from 'suiteRunResult';

function createSuite<T extends CB>(
  suiteName: SuiteName,
  suiteCallback: T
): Suite<T>;
function createSuite<T extends CB>(suiteCallback: T): Suite<T>;
// eslint-disable-next-line max-lines-per-function
function createSuite<T extends CB>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite<T> {
  const [suiteCallback, suiteName] = args.reverse() as [T, SuiteName];

  invariant(
    isFunction(suiteCallback),
    'vest.create: Expected callback to be a function.'
  );

  const { state, stateRef } = createVestState({ suiteName });

  return PersistedContext.run(stateRef, () => {
    return assign(
      PersistedContext.bind(
        stateRef,
        function suite(...args: Parameters<T>): SuiteRunResult {
          // eslint-disable-next-line max-nested-callbacks
          const [, output] = SuiteContext.run({}, () => {
            const emit = useEmit();

            emit(Events.SUITE_RUN_STARTED);

            return isolate(IsolateTypes.SUITE, runSuiteCallback(...args));
          });

          return output;
        }
      ),
      {
        get: persist(suiteResult),
        remove: persist(TestWalker.removeTestByFieldName),
        reset: state.reset,
        resetField: persist(TestWalker.resetField),
      }
    );
  });

  function runSuiteCallback(...args: Parameters<T>): () => SuiteRunResult {
    return () => {
      suiteCallback(...args);
      return suiteRunResult();
    };
  }
}

export type SuiteName = string | undefined;

export type Suite<T extends CB> = ((...args: Parameters<T>) => SuiteRunResult) &
  SuiteMethods;

type SuiteMethods = {
  get: () => SuiteResult;
  reset: () => void;
  remove: (fieldName: string) => void;
  resetField: (fieldName: string) => void;
};

export { createSuite };
