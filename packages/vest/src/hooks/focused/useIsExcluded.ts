import { asArray, dynamicValue, isNotEmptySet } from 'vest-utils';
import {
  TIsolate,
  Walker,
  FocusSelectors,
  TIsolateFocused,
  VestRuntime,
} from 'vestjs-runtime';

import { SuiteContext, useInclusion } from '../../core/context/SuiteContext';
import { useDependencies } from '../../core/Runtime';
import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { TestWalker } from '../../core/isolate/IsolateTest/TestWalker';
import { useIsExcludedIndividually } from '../../isolates/skipWhen';
import { useHasFromRegistry } from '../../core/test/TestRegistry';
import { useHasOnliedTests } from './useHasOnliedTests';

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
  const { fieldName } = VestTest.getData(testObject);
  const focusMatch = useClosestMatchingFocus(testObject, fieldName);

  if (FocusSelectors.isSkipFocused(focusMatch, fieldName)) return true;
  if (FocusSelectors.isOnlyFocused(focusMatch, fieldName)) return false;

  // No explicit focus match for this field.
  // Check the centralized runtime registry for implicit ONLY exclusion.
  if (VestRuntime.hasImplicitOnly()) {
    const inclusion = useInclusion();
    
    if (dynamicValue(inclusion[fieldName], testObject)) {
      return false;
    }

    const dependencies = useDependencies();
    const fieldDependencies = dependencies[fieldName];

    if (fieldDependencies && fieldDependencies.length > 0) {
      if (useShouldIncludeByDependency(fieldName, testObject)) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function useShouldIncludeByDependency(
  fieldName: string,
  testObject: TIsolateTest,
): boolean {
  const dependencies = useDependencies();
  const queue = [fieldName];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const fieldDependencies = dependencies[current];

    if (!fieldDependencies || fieldDependencies.length === 0) {
      continue;
    }

    if (!useIsFieldDirty(current)) {
      continue;
    }

    for (const dep of fieldDependencies) {
      // 1. If any dependency in the chain is explicitly focused, the whole chain is included.
      if (useHasOnliedTests(testObject, dep)) {
        return true;
      }
      // 2. Otherwise, check dependencies of this dependency (transitive)
      queue.push(dep);
    }
  }

  return false;
}

function useIsFieldDirty(fieldName: string): boolean {
  if (useHasFromRegistry('tested', fieldName)) {
    return true;
  }

  const [historyRoot] = VestRuntime.useHistoryRoot();
  if (historyRoot) {
    const historyTest = TestWalker.findTestByFieldName(fieldName, historyRoot);
    if (historyTest) {
      return VestTest.isTested(historyTest).unwrap();
    }
  }

  return false;
}
