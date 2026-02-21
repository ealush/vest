import { dynamicValue, isNotEmptySet } from 'vest-utils';
import {
  TIsolate,
  Walker,
  FocusSelectors,
  TIsolateFocused,
} from 'vestjs-runtime';

import { SuiteContext, useInclusion } from '../../core/context/SuiteContext';
import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { useIsExcludedIndividually } from '../../isolates/skipWhen';
import { useHasOnliedTests } from './useHasOnliedTests';

function useClosestMatchingFocus(
  testObject: TIsolateTest,
  fieldName: string,
): TIsolateFocused | null {
  return Walker.findClosest<TIsolateFocused>(testObject, (child: TIsolate) => {
    if (!FocusSelectors.isIsolateFocused(child)) return false;

    const data = child.data;
    if (!data) return false;

    return data.matchAll || !!data.match?.includes(fieldName);
  });
}

/**
 * Checks whether a specific test profile should be excluded by any of the exclusion conditions.
 *
 * Evaluates in order:
 * 1. `skipWhen` rule.
 * 2. Group targeting (`onlyGroup` excluding top level tests).
 * 3. Field targeting (`only` / `skip`).
 *
 * @param {TIsolateTest} testObject - The test node to evaluate.
 * @returns {boolean} `true` if the test should jump straight to a skipped status.
 */
export function useIsExcluded(testObject: TIsolateTest): boolean {
  if (useIsExcludedIndividually()) return true;

  if (useIsExcludedByGroup(testObject)) return true;

  return useIsExcludedByField(testObject);
}

/**
 * Checks if a specific test should be excluded because it does not belong to a targeted group.
 *
 * When `suite.focus({ onlyGroup: 'groupName' })` is used, ANY test that is NOT inside
 * the targeted group(s) must be skipped. This function specifically handles tests
 * that have NO group at all (top-level tests). Tests inside other groups are handled
 * collectively at the group isolate level in `group.ts`.
 *
 * @param {TIsolateTest} testObject - The test node to evaluate.
 * @returns {boolean} `true` if the test is outside of `onlyGroup` targeting.
 */
function useIsExcludedByGroup(testObject: TIsolateTest): boolean {
  const groupName = VestTest.getGroupName(testObject);
  const { modifiers } = SuiteContext.useX();

  // If `onlyGroup` is applied, ANY test outside of a group is excluded.
  return isNotEmptySet(modifiers.onlyGroup) && !groupName;
}

function useIsExcludedByField(testObject: TIsolateTest): boolean {
  const { fieldName } = VestTest.getData(testObject);
  const focusMatch = useClosestMatchingFocus(testObject, fieldName);

  if (FocusSelectors.isSkipFocused(focusMatch, fieldName)) return true;
  if (FocusSelectors.isOnlyFocused(focusMatch, fieldName)) return false;

  return useIsExcludedByImplicitOnly(testObject);
}

function useIsExcludedByImplicitOnly(testObject: TIsolateTest): boolean {
  if (useHasOnliedTests(testObject)) {
    const { fieldName } = VestTest.getData(testObject);
    const inclusion = useInclusion();
    return !dynamicValue(inclusion[fieldName], testObject);
  }

  return false;
}
