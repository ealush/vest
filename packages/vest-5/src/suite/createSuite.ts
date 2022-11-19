import { isolate } from 'isolate';
import { SuiteSummary } from 'vest';
import type { CB } from 'vest-utils';

import { SuiteContext } from '../context/SuiteContext';

import { IsolateTypes } from 'isolateTypes';
import { produceSuiteSummary } from 'produceSuiteSummary';

function createSuite<T extends CB>(
  suiteName: SuiteName,
  suiteCallback: T
): Suite;
function createSuite<T extends CB>(suiteCallback: T): Suite;
function createSuite<T extends CB>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite {
  const [suiteCallback /*suiteName*/] = args.reverse() as [T, SuiteName];

  function suite() {
    let output;
    isolate(IsolateTypes.SUITE, () => {
      SuiteContext.run({}, () => {
        suiteCallback();
        output = produceSuiteSummary();
      });
    });

    return output as unknown as SuiteSummary;
  }

  return suite;
}

export type SuiteName = string | void;

export type Suite /*<T extends CB>*/ = (
  ...args: any[]
) => SuiteSummary; /* & SuiteMethods<T>;*/

// type SuiteMethods<T> = Record<string, T>;

export { createSuite };
