import asArray from 'asArray';
import { NestedArray } from 'nestedArray';
import optionalFunctionValue from 'optionalFunctionValue';

import { Isolate } from 'IsolateTypes';
import VestTest from 'VestTest';
import ctx from 'ctx';
import { useCursor } from 'isolate';

export function useIsolate(): Isolate {
  return ctx.useX().isolate;
}

export function useIsolateCurrentTests(): NestedArray<VestTest> {
  return useIsolate().tests.current;
}

export function setIsolateCurrentTests(
  tests:
    | VestTest
    | NestedArray<VestTest>
    | ((tests: NestedArray<VestTest>) => NestedArray<VestTest>)
): void {
  // console.log('setting:', tests);

  const currentCursor = useCursor().current();

  useIsolate().tests.current[currentCursor] = optionalFunctionValue(
    tests,
    useIsolate().tests.current[currentCursor]
  );
  // console.log(JSON.stringify(useIsolate().tests.root.current));
}

export function useIsolateRootTests(): NestedArray<VestTest> {
  return useIsolate().tests.root.current;
}

export function setIsolateRootTests(
  tests: (tests: NestedArray<VestTest>) => NestedArray<VestTest>
): void {
  useIsolate().tests.root.current = asArray(
    optionalFunctionValue(tests, useIsolate().tests.root.current)
  );
}

export function useRefreshIsolateRootTests(): void {
  setIsolateRootTests(tests => tests);
}
