import { Nullable, optionalFunctionValue } from 'vest-utils';
import { TIsolate, Walker } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { useInclusion } from 'SuiteContext';
import { VestTest } from 'VestTest';
import { FocusSelectors, TIsolateFocused } from 'focused';
import { useIsExcludedIndividually } from 'skipWhen';
import { useHasOnliedTests } from 'useHasOnliedTests';
//Checks whether a certain test profile excluded by any of the exclusion groups.

function useClosestMatchingFocus(
  testObject: TIsolateTest,
): Nullable<TIsolateFocused> {
  return Walker.findClosest(testObject, (child: TIsolate) => {
    if (!FocusSelectors.isIsolateFocused(child)) return false;

    const { fieldName } = VestTest.getData(testObject);

    return child.data.match?.includes(fieldName) || child.data.matchAll;
  });
}

export function useIsExcluded(testObject: TIsolateTest): boolean {
  const { fieldName } = VestTest.getData(testObject);

  if (useIsExcludedIndividually()) return true;
  const inclusion = useInclusion();
  const focusMatch = useClosestMatchingFocus(testObject);
  // if test is skipped
  // no need to proceed
  if (FocusSelectors.isSkipFocused(focusMatch)) return true;
  const isTestIncluded = FocusSelectors.isOnlyFocused(focusMatch);
  // if field is only'ed
  if (isTestIncluded) return false;

  // If there is _ANY_ `only`ed test (and we already know this one isn't) return true
  if (useHasOnliedTests(testObject)) {
    // Check if inclusion rules for this field (`include` hook)
    return !optionalFunctionValue(inclusion[fieldName], testObject);
  }

  // We're done here. This field is not excluded
  return false;
}
