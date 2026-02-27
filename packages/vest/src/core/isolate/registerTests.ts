/**
 * Module: `src/core/isolate/registerTests.ts`.
 *
 * Provides `registerTests`-related runtime and type utilities used by `vest`.
 */
import { dynamicValue } from 'vest-utils';
import { VestRuntime, TIsolate } from 'vestjs-runtime';

import { TIsolateTest } from './IsolateTest/IsolateTest';
import { VestTest } from './IsolateTest/VestTest';
import { useUpdateRegistry, useClearRegistry } from '../test/TestRegistry';

export function useTestObjects(): [
  TIsolateTest[],
  (tests: TIsolateTest[] | ((prev: TIsolateTest[]) => TIsolateTest[])) => void,
] {
  const root = VestRuntime.useAvailableRoot();

  if (!root) {
    return [[], () => {}];
  }

  return [root.data.tests || [], setTests];

  function setTests(
    tests: TIsolateTest[] | ((prev: TIsolateTest[]) => TIsolateTest[]),
  ) {
    if (!root) return;
    root.data.tests = dynamicValue(tests, root.data.tests || []);
  }
}

const registeredTestsCache = new WeakMap<TIsolate, WeakSet<TIsolateTest>>();

function getRegisteredTestsSet(root: TIsolate): WeakSet<TIsolateTest> {
  let set = registeredTestsCache.get(root);

  if (!set) {
    set = new WeakSet();
    registeredTestsCache.set(root, set);
  }

  return set;
}

export function useAddTestToRoot(testObject: TIsolateTest) {
  const root = VestRuntime.useAvailableRoot();

  if (!root) return;

  const registeredSet = getRegisteredTestsSet(root);

  if (registeredSet.has(testObject)) {
    return;
  }

  registeredSet.add(testObject);

  const [, setTests] = useTestObjects();

  setTests(prev => {
    // Update characteristic registry
    useUpdateRegistry(testObject);

    prev.push(testObject);
    return prev;
  });
}

export function useOnTestStart(testObject: TIsolateTest) {
  useAddTestToRoot(testObject);
}

export function useRegisterSubtree(isolate: TIsolate) {
  if (VestTest.is(isolate)) {
    useAddTestToRoot(isolate);
    // Populate characteristics correctly
    useUpdateRegistry(isolate);
  }

  if (isolate.children) {
    for (const child of isolate.children) {
      useRegisterSubtree(child);
    }
  }
}

export function useReprocessTree(rootNode: TIsolate): void {
  const root = VestRuntime.useAvailableRoot();

  if (root) {
    useClearTestIndexes(root);
  }
  useRegisterSubtree(rootNode);
}

function useClearTestIndexes(root: TIsolate) {
  if (root.data.testIndex) {
    root.data.testIndex.clear();
  }
  useClearRegistry(root);
}
