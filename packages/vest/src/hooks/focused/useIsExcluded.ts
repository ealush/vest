import {
  Nullable,
  isNotEmpty,
  isNotNullish,
  optionalFunctionValue,
} from 'vest-utils';
import { Isolate, Walker } from 'vestjs-runtime';

import { FocusModes } from 'FocusedKeys';
import { IsolateTest } from 'IsolateTest';
import { useInclusion } from 'SuiteContext';
import { IsolateFocused } from 'focused';
import { isIsolateFocused } from 'isIsolateFocused';
import { useIsExcludedIndividually } from 'skipWhen';
//Checks whether a certain test profile excluded by any of the exclusion groups.

function useClosestMatchingFocus(
  testObject: IsolateTest
): Nullable<IsolateFocused> {
  return Walker.findClosest(testObject, (child: Isolate) => {
    if (!isIsolateFocused(child)) return false;

    return child.match?.includes(testObject.fieldName);
  });
}

function hasFocus(focus: Nullable<IsolateFocused>) {
  return isNotEmpty(focus?.match);
}

function isSkipFocused(focus: Nullable<IsolateFocused>): boolean {
  return focus?.focusMode === FocusModes.SKIP && hasFocus(focus);
}

function isOnlyFocused(focus: Nullable<IsolateFocused>): boolean {
  return (
    focus?.focusMode === FocusModes.ONLY &&
    (hasFocus(focus) || focus?.matchAll === true)
  );
}

// eslint-disable-next-line complexity, max-statements
export function useIsExcluded(testObject: IsolateTest): boolean {
  const { fieldName } = testObject;

  if (useIsExcludedIndividually()) return true;

  const inclusion = useInclusion();

  const focusMatch = useClosestMatchingFocus(testObject);

  // if test is skipped
  // no need to proceed
  if (isSkipFocused(focusMatch)) return true;

  const isTestIncluded = isOnlyFocused(focusMatch);

  // if field is only'ed
  if (isTestIncluded) return false;

  // If there is _ANY_ `only`ed test (and we already know this one isn't) return true
  if (useHasIncludedTests(testObject)) {
    // Check if inclusion rules for this field (`include` hook)
    return !optionalFunctionValue(inclusion[fieldName]);
  }

  // We're done here. This field is not excluded
  return false;
}

/**
 * Checks if context has included tests
 */
function useHasIncludedTests(testObject: IsolateTest): boolean {
  return isNotNullish(
    Walker.findClosest(testObject, (child: Isolate) => {
      if (!isIsolateFocused(child)) return false;

      return isOnlyFocused(child);
    })
  );
}
