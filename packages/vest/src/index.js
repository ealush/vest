import enforce from '../../n4s/src/enforce';
import create from './core/createSuite';
import state from './core/state';
import reset from './core/state/reset';
import test from './core/test';
import validate from './core/validate';
import * as hooks from './hooks';
import runWithContext from './lib/runWithContext';
import singleton from './lib/singleton';

const VERSION = VEST_VERSION;
const Enforce = enforce.Enforce;

export default {
  Enforce,
  VERSION,
  create,
  enforce,
  reset,
  runWithContext,
  test,
  validate,
  ...hooks,
};

singleton.register();
state.register();
