import defaultTo from 'defaultTo';
import { isNotEmpty } from 'isEmpty';
import removeElementFromArray from 'removeElementFromArray';
import { throwErrorDeferred } from 'throwError';

import VestTest from 'VestTest';
import { useCursorAt } from 'cursorAt';
import isSameProfileTest from 'isSameProfileTest';
import { usePrevTestObjects, useTestObjects } from 'stateHooks';

export function useTestAtCursor(newTestObject: VestTest): VestTest {
  const [, setPrevTestObjects] = usePrevTestObjects();

  let prevTest = useGetTestAtCursor();

  if (shouldPurgePrevTest(prevTest, newTestObject)) {
    throwTestOrderError(prevTest, newTestObject);

    // TODO: This is only half of the story.
    // Here we handle just the omission of tests in the middle of the test suite.
    // We need to also handle a case in which tests are added in between other tests, at the
    // at the moment all we can do is just remove tests until we find a matching test.
    // A viable solution would be to use something like React's key prop to identify tests regardless
    // of their position in the suite. https://reactjs.org/docs/lists-and-keys.html#keys
    // This is most important when using test.each.
    while (shouldPurgePrevTest(prevTest, newTestObject)) {
      setPrevTestObjects(prevTestObjects =>
        removeElementFromArray(prevTestObjects, prevTest)
      );

      prevTest = useGetTestAtCursor();
    }
  }

  const nextTest = defaultTo(prevTest, newTestObject);
  useSetTestAtCursor(nextTest);

  return nextTest;
}

export function useSetTestAtCursor(testObject: VestTest): void {
  const cursorAt = useCursorAt();
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

function useGetTestAtCursor(): VestTest {
  const cursorAt = useCursorAt();
  const [prevTestObjects] = usePrevTestObjects();

  return prevTestObjects[cursorAt];
}

function shouldPurgePrevTest(prevTest: VestTest, newTest: VestTest): boolean {
  return isNotEmpty(prevTest) && !isSameProfileTest(prevTest, newTest);
}

function throwTestOrderError(
  prevTest: VestTest,
  newTestObject: VestTest
): void {
  throwErrorDeferred(`Vest Critical Error: Tests called in different order than previous run.
    expected: ${prevTest.fieldName}
    received: ${newTestObject.fieldName}
    This usually happens when you conditionally call your tests using if/else.
    This might lead to unexpected validation results.
    Replacing if/else with skipWhen solves these issues.`);
}
