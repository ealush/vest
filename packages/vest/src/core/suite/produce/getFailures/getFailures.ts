import { Severity } from 'Severity';
import collectFailureMessages from 'collectFailureMessages';
import getFailuresArrayOrObject from 'getFailuresArrayOrObject';
import { useTestsFlat } from 'stateHooks';

export function getErrors(): Record<string, string[]>;
export function getErrors(fieldName?: string): string[];
export function getErrors(
  fieldName?: string
): string[] | Record<string, string[]> {
  return getFailures(Severity.ERRORS, fieldName);
}

export function getError(fieldName: string): string;
export function getError(fieldName: string): string {
  return getErrors(fieldName)[0];
}

export function getWarnings(): Record<string, string[]>;
export function getWarnings(fieldName?: string): string[];
export function getWarnings(
  fieldName?: string
): string[] | Record<string, string[]> {
  return getFailures(Severity.WARNINGS, fieldName);
}

// export function getWarning(
//   fieldName?: string
// ): string {
//   return getFailures(Severity.WARNINGS, fieldName);
// }
export function getWarning(fieldName: string): string;
export function getWarning(fieldName: string): string {
  return getWarnings(fieldName)[0];
}

/**
 * @returns suite or field's errors or warnings.
 */
function getFailures(severityKey: Severity, fieldName?: string) {
  const testObjects = useTestsFlat();
  const failureMessages = collectFailureMessages(severityKey, testObjects, {
    fieldName,
  });
  return getFailuresArrayOrObject(failureMessages, fieldName);
}
