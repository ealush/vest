import asArray from 'asArray';
import createCache from 'cache';
import type { NestedArray } from 'nestedArray';
import * as nestedArray from 'nestedArray';

import VestTest from 'VestTest';
import type { StateKey, StateRef, StateValue } from 'createStateRef';
import ctx from 'ctx';

// STATE REF
export function useStateRef(): Exclude<StateRef, void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return ctx.useX().stateRef!; // I should revisit this
}

// STATE KEYS
export function useSuiteId(): StateValue<'suiteId'> {
  return useStateRef().suiteId()[0];
}
export function useSuiteName(): StateValue<'suiteName'> {
  return useStateRef().suiteName()[0];
}
export function useTestCallbacks(): StateKey<'testCallbacks'> {
  return useStateRef().testCallbacks();
}
export function useOptionalFields(): StateKey<'optionalFields'> {
  return useStateRef().optionalFields();
}

export function useTestObjects(): StateKey<'testObjects'> {
  return useStateRef().testObjects();
}

// STATE ACTIONS

export function useRefreshTestObjects(): void {
  const [, setTestObjects] = useTestObjects();

  setTestObjects(({ current, prev }) => ({
    prev,
    current: asArray(current),
  }));
}

export function useSetTests(
  handler: (current: NestedArray<VestTest>) => NestedArray<VestTest>
): void {
  const [, testObjects] = useTestObjects();

  testObjects(({ current, prev }) => ({
    prev,
    current: asArray(handler(current)),
  }));
}

// Derived state

export function useAllIncomplete(): VestTest[] {
  const [{ current }] = useTestObjects();

  return nestedArray.flatten(
    nestedArray.transform(current, testObject =>
      testObject.isPending() ? testObject : null
    )
  );
}

const flatCache = createCache();
export function useTestsFlat(): VestTest[] {
  const [{ current }] = useTestObjects();

  return flatCache([current], () => nestedArray.flatten(current));
}

export function useEachTestObject(
  handler: (testObject: VestTest) => void
): void {
  const testObjects = useTestsFlat();

  testObjects.forEach(handler);
}
