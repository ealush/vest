import create from 'createSuite';
import enforce from 'enforce';
import { only, skip, warn, group, optional } from 'hooks';
import test from 'test';

const VERSION = __LIB_VERSION__;

export default {
  VERSION,
  create,
  enforce,
  group,
  only,
  optional,
  skip,
  test,
  warn,
};

export { VERSION, create, enforce, group, only, optional, skip, test, warn };
