import createCache from 'cache';
import defaultTo from 'defaultTo';
import type { TStateHandlerReturn } from 'vast';

import VestTest from 'VestTest';
import type { TStateRef } from 'createStateRef';
import ctx from 'ctx';
import type { TDraftResult } from 'produceDraft';

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

const omittedFieldsCache = createCache();
export function useOmittedFields(): Record<string, true> {
  const [testObjects] = useTestObjects();

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

export function useStateRef(): Exclude<TStateRef, void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return ctx.useX().stateRef!; // I should revisit this
}

export function useTestObjects(): TStateHandlerReturn<VestTest[]> {
  return useStateRef().testObjects();
}

export function usePrevTestObjects(): TStateHandlerReturn<VestTest[]> {
  return useStateRef().prevTestObjects();
}

export function useTestAtCursor(initialValue: VestTest): VestTest {
  const [cursorAt] = useCursorAt();
  const [prevTestObjects] = usePrevTestObjects();

  const nextTest = defaultTo(prevTestObjects[cursorAt], initialValue);
  useSetTestAtCursor(nextTest);

  return nextTest;
}

export function useSetTestAtCursor(testObject: VestTest): void {
  const [cursorAt] = useCursorAt();
  const [testObjects, setTestObjects] = useTestObjects();

  if (testObject === testObjects[cursorAt]) {
    return;
  }

  setTestObjects((testObjects: VestTest[]) => {
    const newTestsOrder = testObjects.slice(0);
    newTestsOrder[cursorAt] = testObject;
    return newTestsOrder;
  });
}

export function useSetNextCursorAt(): void {
  const [, setCursorAt] = useCursorAt();

  setCursorAt((cursorAt: number) => cursorAt + 1);
}

export function useRefreshTestObjects(): void {
  const [, setTestObjects] = useTestObjects();

  setTestObjects(testObjects => testObjects.slice(0));
}

export function useCursorAt(): TStateHandlerReturn<number> {
  return useStateRef().testObjectsCursor();
}

const incompleteCache = createCache();
export function useAllIncomplete(): VestTest[] {
  const [testObjects] = useTestObjects();

  return incompleteCache([testObjects], () =>
    testObjects.filter(testObject => testObject.isPending())
  );
}
