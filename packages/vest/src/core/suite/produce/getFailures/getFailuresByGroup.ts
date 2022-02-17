import throwError from 'throwError';

import { Severity } from 'Severity';
import collectFailureMessages from 'collectFailureMessages';
import getFailuresArrayOrObject from 'getFailuresArrayOrObject';
import { useTestsFlat } from 'stateHooks';

export function getErrorsByGroup(groupName: string): Record<string, string[]>;
export function getErrorsByGroup(
  groupName: string,
  fieldName: string
): string[];
export function getErrorsByGroup(
  groupName: string,
  fieldName?: string
): string[] | Record<string, string[]> {
  const errors = getByGroup(Severity.ERRORS, groupName, fieldName);

  return getFailuresArrayOrObject(errors, fieldName);
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
  const warnings = getByGroup(Severity.WARNINGS, groupName, fieldName);

  return getFailuresArrayOrObject(warnings, fieldName);
}

/**
 * Gets failure messages by group.
 */
function getByGroup(
  severityKey: Severity,
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
  const testObjects = useTestsFlat();
  return collectFailureMessages(severityKey, testObjects, {
    group,
    fieldName,
  });
}
