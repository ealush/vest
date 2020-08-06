import enforce from '../../n4s/src/enforce';
import create from './core/createSuite';
import reset from './core/state/reset';
import test from './core/test';
import validate from './core/validate';
import { draft, only, skip, warn, get, group } from './hooks';
import runWithContext from './lib/runWithContext';

const VERSION = VEST_VERSION;

export default {
  VERSION,
  create,
  draft,
  enforce,
  get,
  group,
  only,
  reset,
  runWithContext,
  skip,
  test,
  validate,
  warn,
};

export {
  VERSION,
  create,
  draft,
  enforce,
  get,
  group,
  only,
  reset,
  runWithContext,
  skip,
  test,
  validate,
  warn,
};
