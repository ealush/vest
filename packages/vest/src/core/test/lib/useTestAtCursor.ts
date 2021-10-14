import defaultTo from 'defaultTo';
import { isNotEmpty } from 'isEmpty';
import { throwErrorDeferred } from 'throwError';

import VestTest from 'VestTest';
import isSameProfileTest from 'isSameProfileTest';
import {
  useCursorAt,
  usePrevTestObjects,
  useSetTestAtCursor,
} from 'stateHooks';

export default function useTestAtCursor(initialValue: VestTest): VestTest {
  const [cursorAt] = useCursorAt();
  const [prevTestObjects] = usePrevTestObjects();

  if (
    isNotEmpty(prevTestObjects[cursorAt]) &&
    !isSameProfileTest(prevTestObjects[cursorAt], initialValue)
  ) {
    throwErrorDeferred(`Vest Critical Error: Tests called in different order than previous run.
    The test at cursor ${cursorAt} was not the same profile as the previous test.
    expected: ${JSON.stringify(prevTestObjects[cursorAt])}
    actual: ${JSON.stringify(initialValue)}
    This usually happens when you conditionally call your tests using if/else.
    This might lead to unexpected behavior in your test results.
    Replacing if/else with skipWhen solves these issues.`);
  }

  const nextTest = defaultTo(prevTestObjects[cursorAt], initialValue);
  useSetTestAtCursor(nextTest);

  return nextTest;
}
