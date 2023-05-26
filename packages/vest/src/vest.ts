import { enforce } from 'n4s';
// eslint-disable-next-line import/order -- will handle this circular dep issue later.
import { optional } from 'optional';

import type { IsolateTest } from 'IsolateTest';
import type {
  SuiteResult,
  SuiteRunResult,
  SuiteSummary,
} from 'SuiteResultTypes';
import type { Suite } from 'SuiteTypes';
import { createSuite } from 'createSuite';
import { each } from 'each';
import { skip, only } from 'exclusive';
import { group } from 'group';
import { include } from 'include';
import { mode, Modes } from 'mode';
import { omitWhen } from 'omitWhen';
import { skipWhen } from 'skipWhen';
import { staticSuite } from 'staticSuite';
import { suiteSelectors } from 'suiteSelectors';
import { test } from 'test';
import { warn } from 'warn';

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
  suiteSelectors,
  each,
  mode,
  staticSuite,
  Modes,
};

export type { SuiteResult, SuiteRunResult, SuiteSummary, IsolateTest, Suite };
