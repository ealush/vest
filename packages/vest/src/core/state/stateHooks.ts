import type { TStateHandlerReturn } from 'vast';

import VestTest from 'VestTest';
import type { TStateRef } from 'createStateRef';
import ctx from 'ctx';
import type { TDraftResult } from 'produceDraft';

export function usePending(): TStateHandlerReturn<VestTest[]> {
  return useStateRef().pending();
}
export function useLagging(): TStateHandlerReturn<VestTest[]> {
  return useStateRef().lagging();
}
export function useSuiteId(): TStateHandlerReturn<string> {
  return useStateRef().suiteId();
}
export function useTestCallbacks(): TStateHandlerReturn<{
  fieldCallbacks: Record<string, ((res: TDraftResult) => void)[]>;
  doneCallbacks: ((res: TDraftResult) => void)[];
}> {
  return useStateRef().testCallbacks();
}
export function useSkippedTests(): TStateHandlerReturn<VestTest[]> {
  return useStateRef().skippedTests();
}
export function useOptionalFields(): TStateHandlerReturn<
  Record<string, boolean>
> {
  return useStateRef().optionalFields();
}
export function useStateRef(): Exclude<TStateRef, void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return ctx.useX().stateRef!; // I should revisit this
}

export function useTestsOrdered(): TStateHandlerReturn<VestTest[]> {
  return useStateRef().testsOrdered();
}

export function useTestAtCursor(initialValue: VestTest): VestTest {
  const [cursorAt] = useCursorAt();
  const [testsOrder, setTestsOrder] = useTestsOrdered();

  if (!testsOrder[cursorAt]) {
    setTestsOrder((testsOrder: VestTest[]) => {
      const newTestsOrder = testsOrder.slice(0);
      newTestsOrder[cursorAt] = initialValue;
      return newTestsOrder;
    });
  }

  return testsOrder[cursorAt] ?? initialValue;
}

export function useSetTestAtCursor(testObject: VestTest): void {
  const [cursorAt] = useCursorAt();
  const [testsOrder, setTestsOrder] = useTestsOrdered();

  if (testObject === testsOrder[cursorAt]) {
    return;
  }

  setTestsOrder((testsOrder: VestTest[]) => {
    const newTestsOrder = testsOrder.slice(0);
    newTestsOrder[cursorAt] = testObject;
    return newTestsOrder;
  });
}

export function useSetNextCursorAt(): void {
  const [, setCursorAt] = useCursorAt();

  setCursorAt((cursorAt: number) => cursorAt + 1);
}

export function useRefreshTestObjects(): void {
  const [, setTestsOrder] = useTestsOrdered();

  setTestsOrder(testsOrdered => testsOrdered.slice(0));
}

function useCursorAt(): TStateHandlerReturn<number> {
  return useStateRef().testsOrderedCursor();
}
