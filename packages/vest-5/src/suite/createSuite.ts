import { assign, CB } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import { createVestState, PersistedContext } from 'PersistedContext';
import { SuiteContext } from 'SuiteContext';
import { SuiteResult, SuiteRunResult } from 'SuiteResultTypes';
import { isolate } from 'isolate';
import { suiteResult } from 'suiteResult';
import { suiteRunResult } from 'suiteRunResult';

function createSuite<T extends CB>(
  suiteName: SuiteName,
  suiteCallback: T
): Suite;
function createSuite<T extends CB>(suiteCallback: T): Suite;
function createSuite<T extends CB>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite {
  const [suiteCallback /*suiteName*/] = args.reverse() as [T, SuiteName];

  const state = createVestState();

  const suite = PersistedContext.bind(state, function suite(): SuiteRunResult {
    const [, output] = SuiteContext.run({}, () => {
      // eslint-disable-next-line max-nested-callbacks
      return isolate(IsolateTypes.SUITE, () => {
        suiteCallback();

        return suiteRunResult();
      });
    });

    return output;
  });

  return assign(suite, {
    get: PersistedContext.bind(state, suiteResult),
  });
}

export type SuiteName = string | void;

export type Suite /*<T extends CB>*/ = ((...args: any[]) => SuiteRunResult) &
  SuiteMethods;

type SuiteMethods = {
  get: () => SuiteResult;
};

export { createSuite };
