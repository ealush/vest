import assign from 'assign';
import createCache from 'cache';

import { FailureMessages } from 'collectFailures';
import ctx from 'ctx';
import genTestsSummary from 'genTestsSummary';
import { parse } from 'parser';
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
      const parsed = parse(summary);

      return assign(summary, {
        getErrors: parsed.getErrors,
        getErrorsByGroup: parsed.getErrorsByGroup,
        getWarnings: parsed.getWarnings,
        getWarningsByGroup: parsed.getWarningsByGroup,
        hasErrors: parsed.hasErrors,
        hasErrorsByGroup: parsed.hasErrorsByGroup,
        hasWarnings: parsed.hasWarnings,
        hasWarningsByGroup: parsed.hasWarningsByGroup,
        isValid: parsed.isValid,
        isValidByGroup: parsed.isValidByGroup,
        suiteName,
      });
    })
  );
}

export type SuiteResult = ReturnType<typeof genTestsSummary> &
  VestResultMethods;

export interface VestResultMethods {
  getErrors(fieldName: string): string[];
  getErrors(): FailureMessages;
  getWarnings(): FailureMessages;
  getWarnings(fieldName: string): string[];
  getErrorsByGroup(groupName: string, fieldName: string): string[];
  getErrorsByGroup(groupName: string): FailureMessages;
  getWarningsByGroup(groupName: string): FailureMessages;
  getWarningsByGroup(groupName: string, fieldName: string): string[];
  hasErrors(fieldName?: string): boolean;
  hasWarnings(fieldName?: string): boolean;
  hasErrorsByGroup(groupName: string, fieldName?: string): boolean;
  hasWarningsByGroup(groupName: string, fieldName?: string): boolean;
  isValid(fieldName?: string): boolean;
  isValidByGroup(groupName: string, fieldName?: string): boolean;
}
