import { createCascade } from 'context';

import { Isolate } from './isolate';

const suiteRuntime = createCascade<SuiteRuntime>();

type SuiteRuntime = {
  isolate: Isolate;
};
