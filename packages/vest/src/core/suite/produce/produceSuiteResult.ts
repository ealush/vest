import { cache as createCache, assign } from 'vest-utils';

import ctx from 'ctx';
import genTestsSummary from 'genTestsSummary';
import { getErrors, getWarnings } from 'getFailures';
import { getErrorsByGroup, getWarningsByGroup } from 'getFailuresByGroup';
import { hasErrors, hasWarnings } from 'hasFailures';
import { hasErrorsByGroup, hasWarningsByGroup } from 'hasFailuresByGroup';
import { isValid, isValidByGroup } from 'isValid';
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
      const ref = { summary };
      return assign(summary, {
        getErrors: ctx.bind(ref, getErrors),
        getErrorsByGroup: ctx.bind(ref, getErrorsByGroup),
        getWarnings: ctx.bind(ref, getWarnings),
        getWarningsByGroup: ctx.bind(ref, getWarningsByGroup),
        hasErrors: ctx.bind(ref, hasErrors),
        hasErrorsByGroup: ctx.bind(ref, hasErrorsByGroup),
        hasWarnings: ctx.bind(ref, hasWarnings),
        hasWarningsByGroup: ctx.bind(ref, hasWarningsByGroup),
        isValid: ctx.bind(ref, isValid),
        isValidByGroup: ctx.bind(ref, isValidByGroup),
        suiteName,
      });
    })
  );
}

export type SuiteResult = ReturnType<typeof genTestsSummary> & {
  /**
   * Returns whether the suite as a whole is valid.
   * Determined if there are no errors, and if no
   * required fields are skipped.
   */
  isValid: typeof isValid;
  isValidByGroup: typeof isValidByGroup;
  hasErrors: typeof hasErrors;
  hasWarnings: typeof hasWarnings;
  getErrors: typeof getErrors;
  getWarnings: typeof getWarnings;
  hasErrorsByGroup: typeof hasErrorsByGroup;
  hasWarningsByGroup: typeof hasWarningsByGroup;
  getErrorsByGroup: typeof getErrorsByGroup;
  getWarningsByGroup: typeof getWarningsByGroup;
};
