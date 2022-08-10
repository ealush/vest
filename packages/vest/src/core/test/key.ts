import { isNullish, nestedArray, asArray, deferThrow } from 'vest-utils';

import VestTest from 'VestTest';
import { useCurrentPath, useIsolate } from 'isolateHooks';
import { useTestObjects } from 'stateHooks';

export function usePrevKeys(): Record<string, VestTest> {
  const [{ prev }] = useTestObjects();

  return asArray<nestedArray.NestedArray<VestTest>>(
    nestedArray.getCurrent(prev, useCurrentPath())
  ).reduce((prevKeys, testObject) => {
    if (!(testObject instanceof VestTest)) {
      return prevKeys;
    }

    if (isNullish(testObject.key)) {
      return prevKeys;
    }

    prevKeys[testObject.key] = testObject;
    return prevKeys;
  }, {} as Record<string, VestTest>);
}

export function usePrevTestByKey(key: string): VestTest | undefined {
  const prev = useIsolate().keys.prev;
  return prev[key];
}

export function useRetainTestKey(key: string, testObject: VestTest) {
  const current = useIsolate().keys.current;
  if (isNullish(current[key])) {
    current[key] = testObject;
  } else {
    deferThrow(
      `Encountered the same test key "${key}" twice. This may lead to tests overriding each other's results, or to tests being unexpectedly omitted.`
    );
  }
}
