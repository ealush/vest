import enforce from '../../n4s/src/enforce';
import create from './core/suite/create';
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
  skip,
  test,
  warn,
};

export { VERSION, create, draft, enforce, group, only, skip, test, warn };
