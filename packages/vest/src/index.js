import create from 'createSuite';
import enforce from 'enforce';
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
