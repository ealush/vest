import singleton from '../../lib/singleton';
import throwError from '../../lib/throwError';
import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';
import { ERROR_OUTSIDE_OF_TEST } from './constants';

/**
 * Sets a running test to warn only mode.
 */
const warn = () => {
  const ctx = singleton.useContext();

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
