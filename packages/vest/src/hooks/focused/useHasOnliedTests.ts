import { isNotNullish } from 'vest-utils';
import {
  TIsolate,
  Walker,
  FocusSelectors,
  TIsolateFocused,
} from 'vestjs-runtime';

import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';

/**
 * Checks if a field name is explicitly focused via an only() call.
 * This walks up the isolate tree from the given testObject to find matching focus isolates.
 */
export function useHasOnliedTests(
  testObject: TIsolateTest,
  fieldName?: string,
): boolean {
  return isNotNullish(
    Walker.findClosest<TIsolateFocused>(testObject, (child: TIsolate) => {
      if (!FocusSelectors.isIsolateFocused(child)) return false;

      return FocusSelectors.isOnlyFocused(child, fieldName);
    }),
  );
}
