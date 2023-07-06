import { isNotNullish } from 'vest-utils';
import { Isolate, Walker } from 'vestjs-runtime';

import { IsolateTest } from 'IsolateTest';
import { TFieldName } from 'SuiteResultTypes';
import { IsolateFocused } from 'focused';
import { isIsolateFocused } from 'isIsolateFocused';

/**
 * Checks if context has included tests
 */
export function useHasOnliedTests(
  testObject: IsolateTest,
  fieldName?: TFieldName
): boolean {
  return isNotNullish(
    Walker.findClosest(testObject, (child: Isolate) => {
      if (!isIsolateFocused(child)) return false;

      return IsolateFocused.isOnlyFocused(child, fieldName);
    })
  );
}
