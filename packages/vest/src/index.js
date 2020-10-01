import enforce from '../../n4s/src/enforce';
import context from './core/context';
import create from './core/suite/create';
import validate from './core/suite/validate';
import test from './core/test';
import { draft, only, skip, warn, group } from './hooks';

const VERSION = VEST_VERSION;

export default {
  VERSION,
  create,
  draft,
  enforce,
  group,
  only,
  runWithContext: context.run,
  skip,
  test,
  validate,
  warn,
};
