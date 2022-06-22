import { invariant } from 'vest-utils';

import context from 'ctx';
import { ERROR_HOOK_CALLED_OUTSIDE } from 'hookErrors';

const ERROR_OUTSIDE_OF_TEST = __DEV__
  ? "warn hook called outside of a test callback. It won't have an effect."
  : 'warn called outside of a test.';

/**
 * Sets a running test to warn only mode.
 */
export default function warn(): void {
  const ctx = context.useX('warn ' + ERROR_HOOK_CALLED_OUTSIDE);

  invariant(ctx.currentTest, ERROR_OUTSIDE_OF_TEST);

  ctx.currentTest.warn();
}
