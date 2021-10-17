import asArray from 'asArray';
import createCache from 'cache';
import type { NestedArray } from 'nestedArray';
import * as nestedArray from 'nestedArray';
import type { TStateHandlerReturn } from 'vast';

import VestTest from 'VestTest';
import type { TStateRef } from 'createStateRef';
import ctx from 'ctx';
import type { TDraftResult } from 'produceDraft';

// STATE REF
export function useStateRef(): Exclude<TStateRef, void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return ctx.useX().stateRef!; // I should revisit this
}

// STATE KEYS
export function useSuiteId(): TStateHandlerReturn<string> {
  return useStateRef().suiteId();
}
export function useTestCallbacks(): TStateHandlerReturn<{
  fieldCallbacks: Record<string, ((res: TDraftResult) => void)[]>;
  doneCallbacks: ((res: TDraftResult) => void)[];
}> {
  return useStateRef().testCallbacks();
}
export function useOptionalFields(): TStateHandlerReturn<
  Record<string, (() => boolean) | boolean>
> {
  return useStateRef().optionalFields();
}

export function useTestObjects(): TStateHandlerReturn<{
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

export function useOmittedFields(): Record<string, true> {
  const testObjects = useTestsFlat();

  return testObjects.reduce((omittedFields, testObject) => {
    if (omittedFields[testObject.fieldName]) {
      return omittedFields;
    }

    if (testObject.isOmitted()) {
      omittedFields[testObject.fieldName] = true;
    }

    return omittedFields;
  }, {} as Record<string, true>);
}

const flatCache = createCache();
export function useTestsFlat(): VestTest[] {
  const [{ current }] = useTestObjects();

  return flatCache([current], () => nestedArray.flatten(current));
}
