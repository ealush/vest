import { enforce } from 'n4s';

import { registerReconciler } from './core/isolate/VestReconciler';
import { test } from './core/test/test';
import { skip, only } from './hooks/focused/focused';
import { include } from './hooks/include';
import { Modes } from './hooks/optional/Modes';
import { mode } from './hooks/optional/mode';
import { optional } from './hooks/optional/optional';
import { warn } from './hooks/warn';
import { each } from './isolates/each';
import type { Suite } from './suite/SuiteTypes';
import type { SuiteResult, SuiteSummary } from './suiteResult/SuiteResultTypes';
import { createSuite } from './suite/createSuite';
import { group } from './isolates/group';
import { omitWhen } from './isolates/omitWhen';
import { skipWhen } from './isolates/skipWhen';
import { suiteSelectors } from './suiteResult/selectors/suiteSelectors';

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
  Modes,
  registerReconciler,
};

export type { SuiteResult, SuiteSummary, Suite };
