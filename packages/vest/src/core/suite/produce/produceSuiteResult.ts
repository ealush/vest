import { cache as createCache, assign } from 'vest-utils';

import ctx from 'ctx';
import genTestsSummary from 'genTestsSummary';
import { useStateRef, useTestsFlat, useSuiteName } from 'stateHooks';
import { SuiteSelectors, suiteSelectors } from 'suiteSelectors';

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

export type SuiteResult = ReturnType<typeof genTestsSummary> & SuiteSelectors;
