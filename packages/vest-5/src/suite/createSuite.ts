import type { CB } from 'vest-utils';

function createSuite<T extends CB>(
  suiteName: SuiteName,
  suiteCallback: T
): Suite<T>;
function createSuite<T extends CB>(suiteCallback: T): Suite<T>;
function createSuite<T extends CB>(
  ...args: [suiteName: SuiteName, suiteCallback: T] | [suiteCallback: T]
): Suite<T> {
  const [suiteCallback, suiteName] = args.reverse() as [T, SuiteName];
}

export type SuiteName = string | void;

export type Suite<T extends CB> = {};
