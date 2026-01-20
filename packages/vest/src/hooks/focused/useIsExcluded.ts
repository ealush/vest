import { Nullable, dynamicValue, makeResult, Result } from 'vest-utils';
import { TIsolate, Walker } from 'vestjs-runtime';

import { useInclusion } from '../../core/context/SuiteContext';
import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { useIsExcludedIndividually } from '../../isolates/skipWhen';

import { FocusSelectors, TIsolateFocused } from './focused';
import { useHasOnliedTests } from './useHasOnliedTests';
//Checks whether a certain test profile excluded by any of the exclusion groups.

function useClosestMatchingFocus(
  testObject: TIsolateTest,
): Result<Nullable<TIsolateFocused>> {
  const { fieldName } = VestTest.getData(testObject);
  const groupName = VestTest.getGroupName(testObject);

  return makeResult.Ok(
    Walker.findClosest(testObject, (child: TIsolate) => {
      if (!FocusSelectors.isIsolateFocused(child)) return false;

      return FocusSelectors.isFocusMatch(
        child as TIsolateFocused,
        fieldName,
        groupName,
      ).unwrap();
    }),
  );
}

export function useIsExcluded(testObject: TIsolateTest): boolean {
  if (useIsExcludedIndividually()) return true;
  return useIsExcludedByFocus(testObject);
}

function useIsExcludedByFocus(testObject: TIsolateTest): boolean {
  const { fieldName } = VestTest.getData(testObject);
  const groupName = VestTest.getGroupName(testObject);
  const focusMatch = useClosestMatchingFocus(testObject).unwrap();

  // if test is skipped
  // no need to proceed
  if (FocusSelectors.isSkipFocused(focusMatch, fieldName, groupName).unwrap()) {
    return true;
  }

  if (FocusSelectors.isOnlyFocused(focusMatch, fieldName, groupName).unwrap()) {
    // if field is only'ed
    return false;
  }

  return useIsExcludedByInclusion(testObject, fieldName, groupName);
}

function useIsExcludedByInclusion(
  testObject: TIsolateTest,
  fieldName: string,
  groupName?: string,
): boolean {
  // If there is _ANY_ `only`ed test (and we already know this one isn't) return true
  if (!useHasOnliedTests(testObject, fieldName, groupName)) {
    return false;
  }

  const inclusion = useInclusion();
  // Check if inclusion rules for this field (`include` hook)
  return !dynamicValue(inclusion[fieldName], testObject);
}
