/**
 * Module: `src/hooks/focused/useHasOnliedTests.ts`.
 *
 * Provides `useHasOnliedTests`-related runtime and type utilities used by `vest`.
 */
import { isNotNullish } from 'vest-utils';
import {
  TIsolate,
  Walker,
  FocusSelectors,
  TIsolateFocused,
} from 'vestjs-runtime';

import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';

/**
 * Checks if context has included tests
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
