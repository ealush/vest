import { isNotNullish } from 'vest-utils';
import { TIsolate, Walker } from 'vestjs-runtime';

import { TIsolateTest } from '@/core/isolate/IsolateTest/IsolateTest';
import { FocusSelectors } from '@/hooks/focused/focused';
import { TFieldName } from '@/suiteResult/SuiteResultTypes';

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
