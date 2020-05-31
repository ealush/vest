import any from 'anyone/any';
import enforce from 'n4s/dist/enforce.min';
import { VERSION } from './constants';
import createSuite from './core/createSuite';
import state from './core/state';
import reset from './core/state/reset';
import test from './core/test';
import validate from './core/validate';
import * as hooks from './hooks';
import runWithContext from './lib/runWithContext';
import singleton from './lib/singleton';

export default singleton.register(
  {
    Enforce: enforce.Enforce,
    VERSION,
    any,
    create: createSuite,
    enforce,
    reset,
    runWithContext,
    test,
    validate,
    ...hooks,
  },
  state.register
);
