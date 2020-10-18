import enforce from 'n4s';
import create from './core/suite/create';
import test from './core/test';
import { draft, only, skip, warn, group } from './hooks';

const VERSION = __LIB_VERSION__;

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
