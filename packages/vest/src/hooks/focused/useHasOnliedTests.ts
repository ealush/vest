import { isNotNullish } from 'vest-utils';
import { TIsolate, Walker } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { TFieldName } from 'SuiteResultTypes';
import { FocusSelectors } from 'focused';

/**
 * Checks if context has included tests
 */
export function useHasOnliedTests(
  testObject: TIsolateTest,
  fieldName?: TFieldName,
): boolean {
  return isNotNullish(
    Walker.findClosest(testObject, (child: TIsolate) => {
      if (!FocusSelectors.isIsolateFocused(child)) return false;

      return FocusSelectors.isOnlyFocused(child, fieldName);
    }),
  );
}
