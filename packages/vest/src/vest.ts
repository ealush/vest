import { enforce } from 'n4s';

import { registerReconciler } from './core/isolate/VestReconciler';
import { test } from './core/test/test';
import { skip, only } from './hooks/focused/focused';
import { include } from './hooks/include';
import { Modes } from './hooks/optional/Modes';
import { mode } from './hooks/optional/mode';
import { optional } from './hooks/optional/optional';
import { warn, useWarn, success, useSuccess } from './hooks/useSeverity';
import { each } from './isolates/each';
import { group } from './isolates/group';
import { omitWhen } from './isolates/omitWhen';
import { skipWhen } from './isolates/skipWhen';
import type { Suite } from './suite/SuiteTypes';
import { createSuite } from './suite/createSuite';
import type { SuiteConfig } from './suite/createSuite';
import type { SuiteResult, SuiteSummary } from './suiteResult/SuiteResultTypes';
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
  useWarn,
  success,
  useSuccess,
  include,
  suiteSelectors,
  each,
  mode,
  Modes,
  registerReconciler,
};

export type { SuiteResult, SuiteSummary, Suite, SuiteConfig };
