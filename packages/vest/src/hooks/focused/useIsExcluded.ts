import { Nullable, dynamicValue, makeResult, Result } from 'vest-utils';
import { TIsolate, Walker } from 'vestjs-runtime';

import { SuiteContext, useInclusion } from '../../core/context/SuiteContext';
import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { useIsExcludedIndividually } from '../../isolates/skipWhen';

import { FocusSelectors, TIsolateFocused } from './focused';
import { useHasOnliedTests } from './useHasOnliedTests';
//Checks whether a certain test profile excluded by any of the exclusion groups.

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

export function useIsExcluded(testObject: TIsolateTest): boolean {
  if (useIsExcludedIndividually()) return true;

  if (useIsExcludedByGroup(testObject)) return true;

  return useIsExcludedByField(testObject);
}

function useIsExcludedByGroup(testObject: TIsolateTest): boolean {
  const groupName = VestTest.getGroupName(testObject);
  const { modifiers } = SuiteContext.useX();

  // If `onlyGroup` is applied, ANY test outside of a group is excluded.
  return !!modifiers.onlyGroupSet && !groupName;
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
