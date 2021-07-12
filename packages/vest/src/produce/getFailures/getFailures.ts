import collectFailureMessages from 'collectFailureMessages';
import { useTestObjects } from 'stateHooks';
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
  const [testObjects] = useTestObjects();
  const failureMessages = collectFailureMessages(severityKey, testObjects, {
    fieldName,
  });

  if (fieldName) {
    return failureMessages[fieldName];
  }

  return failureMessages;
}
