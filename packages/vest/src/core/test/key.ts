import asArray from 'asArray';
import { isNullish } from 'isNullish';
import * as nestedArray from 'nestedArray';
import { throwErrorDeferred } from 'throwError';

import VestTest from 'VestTest';
import ctx from 'ctx';
import { useTestObjects } from 'stateHooks';
import * as testCursor from 'testCursor';

export function usePrevKeys(): Record<string, VestTest> {
  const [{ prev }] = useTestObjects();

  return asArray(nestedArray.getCurrent(prev, testCursor.usePath())).reduce(
    (prevKeys, testObject) => {
      if (!(testObject instanceof VestTest)) {
        return prevKeys;
      }

      if (isNullish(testObject.key)) {
        return prevKeys;
      }

      prevKeys[testObject.key] = testObject;
      return prevKeys;
    },
    {} as Record<string, VestTest>
  );
}

export function usePrevTestByKey(key: string): VestTest | undefined {
  const prev = ctx.useX().isolate.keys.prev;
  return prev[key];
}

export function useRetainTestKey(key: string, testObject: VestTest) {
  const context = ctx.useX();

  const current = context.isolate.keys.current;
  if (isNullish(current[key])) {
    current[key] = testObject;
  } else {
    throwErrorDeferred(
      `Encountered the same test key "${key}" twice. This may lead to tests overriding each other's results, or to tests being unexpectedly omitted.`
    );
  }
}
