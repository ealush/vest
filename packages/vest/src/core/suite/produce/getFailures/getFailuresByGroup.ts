import invariant from 'invariant';

import { Severity } from 'Severity';
import { collectAll, getByFieldName } from 'collectFailures';
import ctx from 'ctx';
// import getFailuresArrayOrObject from 'getFailuresArrayOrObject';
// import { useTestsFlat } from 'stateHooks';

export function getErrorsByGroup(groupName: string): Record<string, string[]>;
export function getErrorsByGroup(
  groupName: string,
  fieldName: string
): string[];
export function getErrorsByGroup(
  groupName: string,
  fieldName?: string
): string[] | Record<string, string[]> {
  const { summary } = ctx.useX();
  invariant(summary);

  return fieldName
    ? getByFieldName(summary.groups[groupName], Severity.ERRORS, fieldName)
    : collectAll(summary.groups[groupName], Severity.ERRORS);
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
  const { summary } = ctx.useX();
  invariant(summary);

  return fieldName
    ? getByFieldName(summary.groups[groupName], Severity.WARNINGS, fieldName)
    : collectAll(summary.groups[groupName], Severity.WARNINGS);
}
