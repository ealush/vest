import enforce from '../../n4s/src/enforce';
import create from './core/createSuite';
import reset from './core/state/reset';
import test from './core/test';
import validate from './core/validate';
import * as hooks from './hooks';
import runWithContext from './lib/runWithContext';

const VERSION = VEST_VERSION;

export default {
  VERSION,
  create,
  enforce,
  reset,
  runWithContext,
  test,
  validate,
  ...hooks,
};
