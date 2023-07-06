import { Nullable, optionalFunctionValue } from 'vest-utils';
import { Isolate, Walker } from 'vestjs-runtime';

import { IsolateTest } from 'IsolateTest';
import { useInclusion } from 'SuiteContext';
import { IsolateFocused } from 'focused';
import { isIsolateFocused } from 'isIsolateFocused';
import { useIsExcludedIndividually } from 'skipWhen';
import { useHasOnliedTests } from 'useHasOnliedTests';
//Checks whether a certain test profile excluded by any of the exclusion groups.

function useClosestMatchingFocus(
  testObject: IsolateTest
): Nullable<IsolateFocused> {
  return Walker.findClosest(testObject, (child: Isolate) => {
    if (!isIsolateFocused(child)) return false;

    return child.match?.includes(testObject.fieldName) || child.matchAll;
  });
}

// eslint-disable-next-line complexity, max-statements
export function useIsExcluded(testObject: IsolateTest): boolean {
  const { fieldName } = testObject;

  if (useIsExcludedIndividually()) return true;
  const inclusion = useInclusion();
  const focusMatch = useClosestMatchingFocus(testObject);
  // if test is skipped
  // no need to proceed
  if (IsolateFocused.isSkipFocused(focusMatch)) return true;
  const isTestIncluded = IsolateFocused.isOnlyFocused(focusMatch);
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
