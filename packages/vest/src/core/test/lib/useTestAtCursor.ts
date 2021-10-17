import defaultTo from 'defaultTo';
import { isEmpty, isNotEmpty } from 'isEmpty';
import * as nestedArray from 'nestedArray';
import type { NestedArray } from 'nestedArray';
import { throwErrorDeferred } from 'throwError';

import VestTest from 'VestTest';
import isSameProfileTest from 'isSameProfileTest';
import { shouldAllowReorder } from 'isolate';
import { useTestObjects, useSetTests } from 'stateHooks';
import * as testCursor from 'testCursor';

/**
 * This module serves as the "collision detection" mechanism for Vest.
 * It is used to ensure that tests are not called in a different order than
 * they were called in the previous run.
 * If they are, it will throw a deferred error unless explicitly allowed.
 *
 * For now it seems pretty safe, and it covers most common use cases, but it can
 * be improved in the future both in terms of performance and scenarios it covers.
 */

// eslint-disable-next-line max-statements, max-lines-per-function
export function useTestAtCursor(newTestObject: VestTest): VestTest {
  const [testObjects, setTestObjects] = useTestObjects();

  const prevTests = testObjects.prev;

  if (isEmpty(prevTests)) {
    useSetTestAtCursor(newTestObject);
    return newTestObject;
  }

  let prevTest: NestedArray<VestTest> | VestTest | null =
    useGetTestAtCursor(prevTests);

  if (shouldPurgePrevTest(prevTest, newTestObject)) {
    throwTestOrderError(prevTest, newTestObject);

    // Here we handle just the omission of tests in the middle of the test suite.
    // We need to also handle a case in which tests are added in between other tests.
    // At the moment all we can do is just splice the tests out of the array when this happens.
    // A viable solution would be to use something like React's key prop to identify tests regardless
    // of their position in the suite. https://reactjs.org/docs/lists-and-keys.html#keys
    const current = nestedArray.getCurrent(prevTests, testCursor.usePath());

    const cursorAt = testCursor.useCursorAt();
    current.splice(cursorAt);
    // We actually don't mind mutating the state directly (as can be seen above). There is no harm in it
    // since we're only touching the "prev" state. The reason we still use the setter function is
    // to prevent future headaches if we ever do need to rely on prev-state immutability.
    setTestObjects(({ current }) => ({
      prev: prevTests,
      current,
    }));

    // Need to see if this has any effect at all.
    prevTest = null;
  }
  const nextTest = defaultTo(prevTest, newTestObject) as VestTest;
  useSetTestAtCursor(nextTest);
  return nextTest;
}

export function useSetTestAtCursor(testObject: VestTest): void {
  const cursorPath = testCursor.usePath();

  useSetTests(tests =>
    nestedArray.setValueAtPath(tests, cursorPath, testObject)
  );
}

function useGetTestAtCursor(tests: NestedArray<VestTest>): VestTest {
  const cursorPath = testCursor.usePath();

  return nestedArray.valueAtPath(tests, cursorPath) as VestTest;
}

function shouldPurgePrevTest(prevTest: VestTest, newTest: VestTest): boolean {
  return isNotEmpty(prevTest) && !isSameProfileTest(prevTest, newTest);
}

function throwTestOrderError(
  prevTest: VestTest,
  newTestObject: VestTest
): void {
  if (shouldAllowReorder()) {
    return;
  }

  throwErrorDeferred(`Vest Critical Error: Tests called in different order than previous run.
    expected: ${prevTest.fieldName}
    received: ${newTestObject.fieldName}
    This happens when you conditionally call your tests using if/else.
    This might lead to incorrect validation results.
    Replacing if/else with skipWhen solves these issues.`);
}
