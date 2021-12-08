import collectFailureMessages from 'collectFailureMessages';
import getFailuresArrayOrObject from 'getFailuresArrayOrObject';
import { useTestsFlat } from 'stateHooks';
import type { TSeverity } from 'vestTypes';

export function getErrors(): Record<string, string[]>;
export function getErrors(fieldName?: string): string[];
export function getErrors(
  fieldName?: string
): string[] | Record<string, string[]> {
  return getFailures('errors', fieldName);
}

export function getWarnings(): Record<string, string[]>;
export function getWarnings(fieldName?: string): string[];
export function getWarnings(
  fieldName?: string
): string[] | Record<string, string[]> {
  return getFailures('warnings', fieldName);
}

/**
 * @returns suite or field's errors or warnings.
 */
function getFailures(severityKey: TSeverity, fieldName?: string) {
  const testObjects = useTestsFlat();
  const failureMessages = collectFailureMessages(severityKey, testObjects, {
    fieldName,
  });

  return getFailuresArrayOrObject(failureMessages, fieldName);
}
