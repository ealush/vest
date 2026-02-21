import {
  Nullable,
  dynamicValue,
  makeResult,
  Result,
  isNotEmptySet,
} from 'vest-utils';
import { TIsolate, Walker } from 'vestjs-runtime';

import { SuiteContext, useInclusion } from '../../core/context/SuiteContext';
import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { useIsExcludedIndividually } from '../../isolates/skipWhen';

import { FocusSelectors, TIsolateFocused } from './focused';
import { useHasOnliedTests } from './useHasOnliedTests';

function useClosestMatchingFocus(
  testObject: TIsolateTest,
): Result<Nullable<TIsolateFocused>> {
  return makeResult.Ok(
    Walker.findClosest(testObject, (child: TIsolate) => {
      if (!FocusSelectors.isIsolateFocused(child)) return false;

      const { fieldName } = VestTest.getData(testObject);

      return child.data.match?.includes(fieldName) || child.data.matchAll;
    }),
  );
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
  const focusMatch = useClosestMatchingFocus(testObject).unwrap();

  // if test is skipped
  // no need to proceed
  if (FocusSelectors.isSkipFocused(focusMatch).unwrap()) return true;

  // if field is only'ed
  if (FocusSelectors.isOnlyFocused(focusMatch).unwrap()) return false;

  return useIsExcludedByImplicitOnly(testObject);
}

function useIsExcludedByImplicitOnly(testObject: TIsolateTest): boolean {
  // If there is _ANY_ `only`ed test (and we already know this one isn't) return true
  if (useHasOnliedTests(testObject)) {
    // Check if inclusion rules for this field (`include` hook)
    const { fieldName } = VestTest.getData(testObject);
    const inclusion = useInclusion();
    return !dynamicValue(inclusion[fieldName], testObject);
  }

  // We're done here. This field is not excluded
  return false;
}
