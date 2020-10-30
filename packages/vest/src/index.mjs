import enforce from 'n4s';

import create from 'createSuite';
import { only, skip, warn, group } from 'hooks';
import test from 'test';

const VERSION = __LIB_VERSION__;

export default {
  VERSION,
  create,
  enforce,
  group,
  only,
  skip,
  test,
  warn,
};

export { VERSION, create, enforce, group, only, skip, test, warn };
