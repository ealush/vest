import create from 'createSuite';
import enforce from 'enforce';
import { only, skip, warn, group, skipWhen } from 'hooks';
import test from 'test';

const VERSION = __LIB_VERSION__;

export default {
  VERSION,
  create,
  enforce,
  group,
  only,
  skip,
  skipWhen,
  test,
  warn,
};

export { VERSION, create, enforce, group, only, skip, test, warn };
