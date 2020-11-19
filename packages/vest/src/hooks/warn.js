import context from 'ctx';
import { ERROR_HOOK_CALLED_OUTSIDE } from 'hookErrors';
import throwError from 'throwError';

/**
 * @type {String} Error message to display when `warn` gets called outside of a test.
 */
const ERROR_OUTSIDE_OF_TEST = __DEV__
  ? "warn hook called outside of a test callback. It won't have an effect."
  : 'warn called outside of a test.';

/**
 * Sets a running test to warn only mode.
 */
const warn = () => {
  const ctx = context.use();

  if (!ctx) {
    throwError('warn ' + ERROR_HOOK_CALLED_OUTSIDE);
    return;
  }

  if (!ctx.currentTest) {
    throwError(ERROR_OUTSIDE_OF_TEST);
    return;
  }

  ctx.currentTest.warn();
};

export default warn;
