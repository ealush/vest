import { asArray, dynamicValue, isNotEmptySet } from 'vest-utils';
import {
  TIsolate,
  Walker,
  FocusSelectors,
  TIsolateFocused,
  VestRuntime,
} from 'vestjs-runtime';

import { SuiteContext, useInclusion } from '../../core/context/SuiteContext';
import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { useIsExcludedIndividually } from '../../isolates/skipWhen';

/**
 * Finds the closest focus isolate that matches a given field name.
 *
 * Uses `Walker.findClosest` starting from `testObject`. Since `findClosest`
 * walks UP through ancestors and searches each level's CHILDREN (siblings),
 * starting from the test ensures we correctly find sibling `IsolateFocused`
 * nodes created by `only()` and `skip()`.
 *
 * Starting from `useIsolate()` (the parent context) would be one level too
 * high, missing focus isolates at the test's own sibling level.
 */
function useClosestMatchingFocus(
  testObject: TIsolateTest,
  fieldName: string,
): TIsolateFocused | null {
  return Walker.findClosest<TIsolateFocused>(testObject, (child: TIsolate) => {
    if (!FocusSelectors.isIsolateFocused(child)) return false;

    const data = child.data;
    if (!data) return false;

    return data.matchAll || asArray(data.match).includes(fieldName);
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

/**
 * Whether an explicit builder field skip authoritatively excludes this test.
 * Used for destructive skip semantics: a field-skipped test clears its
 * retained verdict instead of reusing history. Checked against the builder
 * `skip` list (not the isolate tree) so group-internal `skip(true)`
 * isolates — which must retain history — never count as field skips.
 * Group exclusion, implicit only, skipWhen, and the internal `__skipAll`
 * zero-field focus all retain history and return false here.
 */
export function useIsExcludedByFieldSkip(testObject: TIsolateTest): boolean {
  const { modifiers } = SuiteContext.useX() as {
    modifiers: { __skipAll?: boolean; skip?: unknown };
  };
  if (modifiers.__skipAll) return false;
  const { fieldName } = VestTest.getData(testObject);
  const skip = modifiers.skip as string | readonly string[] | null | undefined;
  if (typeof skip === 'string') return skip === fieldName;
  if (Array.isArray(skip))
    return (skip as readonly unknown[]).includes(fieldName);
  return false;
}

/**
 * Checks if a specific test should be excluded by field-level focus rules.
 *
 * 1. Explicit focus: find the closest `IsolateFocused` sibling from the test's
 *    perspective. If found, skip/only takes immediate effect.
 * 2. Implicit only: if no explicit match was found, query the centralized
 *    `implicitOnlyNodes` registry on the runtime StateRef. If an ancestor
 *    has been flagged (because it contains an ONLY child), the test is excluded
 *    unless it has a matching `include()` rule.
 */
function useIsExcludedByField(testObject: TIsolateTest): boolean {
  // Builder field skip is authoritative independent of fluent order and
  // isolate creation order. Nested imperative focus keeps its existing
  // first-declaration-wins behavior via the isolate lookup below.
  if (useIsExcludedByFieldSkip(testObject)) return true;
  const { fieldName } = VestTest.getData(testObject);
  const focusMatch = useClosestMatchingFocus(testObject, fieldName);

  if (FocusSelectors.isSkipFocused(focusMatch, fieldName)) return true;
  if (FocusSelectors.isOnlyFocused(focusMatch, fieldName)) return false;

  // No explicit focus match for this field.
  // Check the centralized runtime registry for implicit ONLY exclusion.
  if (VestRuntime.hasImplicitOnly()) {
    const inclusion = useInclusion();
    return !dynamicValue(inclusion[fieldName], testObject);
  }

  return false;
}
