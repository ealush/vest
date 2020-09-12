import enforce from '../../n4s/src/enforce';
import context from './core/context';
import create from './core/suite/create';
import reset from './core/suite/reset';
import validate from './core/suite/validate';
import test from './core/test';
import { draft, only, skip, warn, get, group } from './hooks';

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
  runWithContext: context.run,
  skip,
  test,
  validate,
  warn,
};
