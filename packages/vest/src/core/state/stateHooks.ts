import asArray from 'asArray';
import createCache from 'cache';
import type { NestedArray } from 'nestedArray';
import * as nestedArray from 'nestedArray';
import type { StateHandlerReturn } from 'vast';

import VestTest from 'VestTest';
import type { StateRef } from 'createStateRef';
import ctx from 'ctx';
import type { SuiteResult } from 'produceSuiteResult';

// STATE REF
export function useStateRef(): Exclude<StateRef, void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return ctx.useX().stateRef!; // I should revisit this
}

// STATE KEYS
export function useSuiteId(): string {
  return useStateRef().suiteId()[0];
}
export function useSuiteName(): string | void {
  return useStateRef().suiteName()[0];
}
export function useTestCallbacks(): StateHandlerReturn<{
  fieldCallbacks: Record<string, ((res: SuiteResult) => void)[]>;
  doneCallbacks: ((res: SuiteResult) => void)[];
}> {
  return useStateRef().testCallbacks();
}
export function useOptionalFields(): StateHandlerReturn<
  Record<string, (() => boolean) | boolean>
> {
  return useStateRef().optionalFields();
}

export function useTestObjects(): StateHandlerReturn<{
  prev: NestedArray<VestTest>;
  current: NestedArray<VestTest>;
}> {
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
