import { SuiteSelectors, suiteSelectors } from 'suiteSelectors';
import { cache as createCache, assign } from 'vest-utils';

import { SuiteSummary } from 'SuiteSummaryTypes';
import { SuiteName } from 'create';
import ctx from 'ctx';
import genTestsSummary from 'genTestsSummary';
import { useStateRef, useTestsFlat, useSuiteName } from 'stateHooks';

const cache = createCache(1);

export function produceSuiteResult(): SuiteResult {
  const testObjects = useTestsFlat();

  const ctxRef = { stateRef: useStateRef() };

  return cache(
    [testObjects],
    ctx.bind(ctxRef, () => {
      const summary = genTestsSummary();
      const suiteName = useSuiteName();
      return assign(summary, suiteSelectors(summary), {
        suiteName,
      });
    })
  );
}

export type SuiteResult = SuiteSummary &
  SuiteSelectors & { suiteName: SuiteName };
