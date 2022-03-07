import assign from 'assign';
import createCache from 'cache';

import ctx from 'ctx';
import genTestsSummary from 'genTestsSummary';
import { getError, getErrors, getWarnings } from 'getFailures'; // getError,
import { getErrorsByGroup, getWarningsByGroup } from 'getFailuresByGroup';
import { hasErrors, hasWarnings } from 'hasFailures';
import { hasErrorsByGroup, hasWarningsByGroup } from 'hasFailuresByGroup';
import { isValid } from 'isValid';
import { useStateRef, useTestsFlat, useSuiteName } from 'stateHooks';

const cache = createCache(20);

export function produceSuiteResult(): SuiteResult {
  const testObjects = useTestsFlat();

  const ctxRef = { stateRef: useStateRef() };

  return cache(
    [testObjects],
    ctx.bind(ctxRef, () => {
      const suiteName = useSuiteName();
      return assign(genTestsSummary(), {
        getError: ctx.bind(ctxRef, getError),
        getErrors: ctx.bind(ctxRef, getErrors),
        getErrorsByGroup: ctx.bind(ctxRef, getErrorsByGroup),
        // getWarning: ctx.bind(ctxRef, getWarning),
        getWarnings: ctx.bind(ctxRef, getWarnings),
        getWarningsByGroup: ctx.bind(ctxRef, getWarningsByGroup),
        hasErrors: ctx.bind(ctxRef, hasErrors),
        hasErrorsByGroup: ctx.bind(ctxRef, hasErrorsByGroup),
        hasWarnings: ctx.bind(ctxRef, hasWarnings),
        hasWarningsByGroup: ctx.bind(ctxRef, hasWarningsByGroup),
        isValid: ctx.bind(ctxRef, (fieldName?: string) =>
          isValid(produceSuiteResult(), fieldName)
        ),
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
  isValid: (fieldName?: string) => boolean;
  hasErrors: typeof hasErrors;
  hasWarnings: typeof hasWarnings;
  getError: typeof getError;
  getErrors: typeof getErrors;
  // getWarning: typeof getWarning;
  getWarnings: typeof getWarnings;
  hasErrorsByGroup: typeof hasErrorsByGroup;
  hasWarningsByGroup: typeof hasWarningsByGroup;
  getErrorsByGroup: typeof getErrorsByGroup;
  getWarningsByGroup: typeof getWarningsByGroup;
};
