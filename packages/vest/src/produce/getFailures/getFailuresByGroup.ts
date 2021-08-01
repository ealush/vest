import throwError from 'throwError';

import collectFailureMessages from 'collectFailureMessages';
import { useTestsOrdered } from 'stateHooks';
import type { TSeverity } from 'vestTypes';

export function getErrorsByGroup(groupName: string): Record<string, string[]>;
export function getErrorsByGroup(
  groupName: string,
  fieldName: string
): string[];
export function getErrorsByGroup(
  groupName: string,
  fieldName?: string
): string[] | Record<string, string[]> {
  const errors = getByGroup('errors', groupName, fieldName);

  if (fieldName) {
    return errors[fieldName];
  }

  return errors;
}

export function getWarningsByGroup(groupName: string): Record<string, string[]>;
export function getWarningsByGroup(
  groupName: string,
  fieldName: string
): string[];
export function getWarningsByGroup(
  groupName: string,
  fieldName?: string
): string[] | Record<string, string[]> {
  const errors = getByGroup('warnings', groupName, fieldName);

  if (fieldName) {
    return errors[fieldName];
  }

  return errors;
}

/**
 * Gets failure messages by group.
 */
function getByGroup(
  severityKey: TSeverity,
  group: string,
  fieldName?: string
): Record<string, string[]> {
  if (!group) {
    throwError(
      `get${severityKey[0].toUpperCase()}${severityKey.slice(
        1
      )}ByGroup requires a group name. Received \`${group}\` instead.`
    );
  }
  const [testObjects] = useTestsOrdered();
  const failureMessages = collectFailureMessages(severityKey, testObjects, {
    group,
    fieldName,
  });

  return failureMessages;
}
