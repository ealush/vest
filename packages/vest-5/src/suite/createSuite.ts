import { isolate } from 'isolate';
import type { CB } from 'vest-utils';

import { IsolateTypes } from 'isolateTypes';

function createSuite<T extends CB>(
  suiteName: SuiteName,
  suiteCallback: T
): Suite<T>;
function createSuite<T extends CB>(suiteCallback: T): Suite<T>;
function createSuite<T extends CB>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite<T> {
  const [suiteCallback /*suiteName*/] = args.reverse() as [T, SuiteName];

  function suite() {
    isolate(IsolateTypes.SUITE, () => {
      suiteCallback();
    });

    return {};
  }

  return suite;
}

export type SuiteName = string | void;

export type Suite<T extends CB> = (...args: any[]) => SuiteMethods<T>;

type SuiteMethods<T> = Record<string, T>;

export { createSuite };
