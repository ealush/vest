import enforce from '../../n4s/src/enforce';
import context from './core/context';
import create from './core/suite/create';
import test from './core/test';
import { draft, only, skip, warn, group } from './hooks';

const VERSION = VEST_VERSION;
const runWithContext = context.run;

export default {
  VERSION,
  create,
  draft,
  enforce,
  group,
  only,
  runWithContext,
  skip,
  test,
  warn,
};

export {
  VERSION,
  create,
  draft,
  enforce,
  group,
  only,
  runWithContext,
  skip,
  test,
  warn,
};
