import createCache from 'cache';
import flatten from 'flatten';
import type { NestedArray } from 'nestedArray';
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

export function useTestObjects(): TStateHandlerReturn<NestedArray<VestTest>> {
  return useStateRef().testObjects();
}

export function usePrevTestObjects(): TStateHandlerReturn<
  NestedArray<VestTest>
> {
  return useStateRef().prevTestObjects();
}

// STATE ACTIONS

export function useRefreshTestObjects(): void {
  const [, setTestObjects] = useTestObjects();

  setTestObjects(testObjects => testObjects.slice(0));
}

// DERIVED VALUES

export function useTestsFlat(): Array<VestTest> {
  const [testObjects] = useTestObjects();

  return flatten(testObjects);
}

const omittedFieldsCache = createCache();
export function useOmittedFields(): Record<string, true> {
  const testObjects = useTestsFlat();

  return omittedFieldsCache([testObjects], () =>
    testObjects.reduce((omittedFields, testObject) => {
      if (omittedFields[testObject.fieldName]) {
        return omittedFields;
      }

      if (testObject.isOmitted()) {
        omittedFields[testObject.fieldName] = true;
      }

      return omittedFields;
    }, {} as Record<string, true>)
  );
}

const incompleteCache = createCache();
export function useAllIncomplete(): Array<VestTest> {
  const testObjects = useTestsFlat();

  return incompleteCache([testObjects], () =>
    testObjects.filter(testObject => testObject.isPending())
  );
}
