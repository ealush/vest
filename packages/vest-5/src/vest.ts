import { skip, only } from 'exclusive';
import { group } from 'group';
import { include } from 'include';
import { enforce } from 'n4s';
import { omitWhen } from 'omitWhen';
import { optional } from 'optional';
import { skipWhen } from 'skipWhen';
import { test } from 'test';
import { warn } from 'warn';

import { createSuite } from 'createSuite';

export {
  createSuite as create,
  test,
  group,
  optional,
  enforce,
  skip,
  skipWhen,
  omitWhen,
  only,
  warn,
  include,
};
