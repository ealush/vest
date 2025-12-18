import { dynamicValue } from 'vest-utils';
import { VestRuntime, TIsolate } from 'vestjs-runtime';

import { TIsolateTest } from './IsolateTest/IsolateTest';
import { VestTest } from './IsolateTest/VestTest';

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

export function useAddTestToRoot(testObject: TIsolateTest) {
  const [, setTests] = useTestObjects();

  setTests(prev => {
    if (prev.includes(testObject)) {
      return prev;
    }
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
  }

  if (isolate.children) {
    for (const child of isolate.children) {
      useRegisterSubtree(child);
    }
  }
}

export function useReprocessTree(rootNode: TIsolate): void {
  useRegisterSubtree(rootNode);
}
