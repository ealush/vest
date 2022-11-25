import { IsolateTypes } from 'IsolateTypes';
import { isolate } from 'isolate';
import type { CB } from 'vest-utils';

import {
  createVestState,
  PersistedContext,
  useHistoryRoot,
} from 'PersistedContext';
import { SuiteContext, useSuiteRuntimeRoot } from 'SuiteContext';
import { SuiteRunResult, suiteRunResult } from 'suiteRunResult';

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

  return function suite(): SuiteRunResult {
    return PersistedContext.run(state, () => {
      const [, setHistoryRoot] = useHistoryRoot();

      const [, output] = SuiteContext.run({}, () => {
        // eslint-disable-next-line max-nested-callbacks
        return isolate(IsolateTypes.SUITE, () => {
          suiteCallback();

          setHistoryRoot(useSuiteRuntimeRoot());
          return suiteRunResult();
        });
      });

      return output;
    });
  };
}

export type SuiteName = string | void;

export type Suite /*<T extends CB>*/ = (
  ...args: any[]
) => SuiteRunResult; /* & SuiteMethods<T>;*/

// type SuiteMethods<T> = Record<string, T>;

export { createSuite };
