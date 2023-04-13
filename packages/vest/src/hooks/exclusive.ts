import {
  isStringValue,
  asArray,
  hasOwnProperty,
  optionalFunctionValue,
} from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import { IsolateTest } from 'IsolateTest';
import { TExclusion, useExclusion, useInclusion } from 'SuiteContext';
import { TFieldName } from 'SuiteResultTypes';
import { useIsExcludedIndividually } from 'skipWhen';

export type ExclusionItem = string | string[] | undefined;
export type FieldExclusion<F extends TFieldName> = F | F[] | undefined;

/**
 * Adds a field or a list of fields into the inclusion list
 *
 * @example
 *
 * only('username');
 */
// @vx-allow use-use
export function only<F extends TFieldName>(item: FieldExclusion<F>): void {
  return useAddTo(ExclusionGroup.ONLY, 'tests', item);
}

only.group = (item: ExclusionItem) =>
  useAddTo(ExclusionGroup.ONLY, 'groups', item);

/**
 * Adds a field or a list of fields into the exclusion list
 *
 * @example
 *
 * skip('username');
 */
// @vx-allow use-use
export function skip<F extends TFieldName>(item: FieldExclusion<F>): void {
  return useAddTo(ExclusionGroup.SKIP, 'tests', item);
}

skip.group = (item: ExclusionItem) =>
  useAddTo(ExclusionGroup.SKIP, 'groups', item);

//Checks whether a certain test profile excluded by any of the exclusion groups.

// eslint-disable-next-line complexity, max-statements
export function useIsExcluded(testObject: IsolateTest): boolean {
  const { fieldName, groupName } = testObject;

  if (useIsExcludedIndividually()) return true;

  const exclusion = useExclusion();
  const inclusion = useInclusion();
  const keyTests = exclusion.tests;
  const testValue = keyTests[fieldName];

  // if test is skipped
  // no need to proceed
  if (testValue === false) return true;

  const isTestIncluded = testValue === true;

  // If inside a group
  if (groupName) {
    if (useIsGroupExcluded(groupName)) {
      return true; // field excluded by group

      // if group is `only`ed
    } else if (exclusion.groups[groupName] === true) {
      if (isTestIncluded) return false;

      // If there is _ANY_ `only`ed test (and we already know this one isn't)
      if (hasIncludedTests(keyTests)) return true; // Excluded implicitly

      return keyTests[fieldName] === false;
    }
  }

  if (useIsTopLevelWhenThereIsAnIncludedGroup(groupName)) {
    return true;
  }

  // if field is only'ed
  if (isTestIncluded) return false;

  // If there is _ANY_ `only`ed test (and we already know this one isn't) return true
  if (hasIncludedTests(keyTests)) {
    // Check if inclusion rules for this field (`include` hook)
    // TODO: Check if this may need to be moved outside of the condition.
    // What if there are no included tests? This shouldn't run then?
    return !optionalFunctionValue(inclusion[fieldName]);
  }

  // We're done here. This field is not excluded
  return false;
}

/**
 * Checks whether a given group is excluded from running.
 */
export function useIsGroupExcluded(groupName: string): boolean {
  const exclusion = useExclusion();
  const keyGroups = exclusion.groups;

  const groupPresent = hasOwnProperty(keyGroups, groupName);

  // When group is either only'ed or skipped
  if (groupPresent) {
    // Return true if group is skipped and false if only'ed
    return keyGroups[groupName] === false;
  }

  // Group is not present

  // Return whether other groups are included
  return useHasIncludedGroups();
}

/**
 * Adds fields to a specified exclusion group.
 */
function useAddTo(
  exclusionGroup: ExclusionGroup,
  itemType: keyof TExclusion,
  item: ExclusionItem
) {
  const exclusion = useExclusion(ErrorStrings.HOOK_CALLED_OUTSIDE);

  if (!item) {
    return;
  }

  asArray(item).forEach((itemName: string): void => {
    if (!isStringValue(itemName)) {
      return;
    }

    exclusion[itemType][itemName] = exclusionGroup === ExclusionGroup.ONLY;
  });
}

/**
 * Checks if context has included tests
 */
function hasIncludedTests(keyTests: Record<string, boolean>): boolean {
  for (const test in keyTests) {
    if (keyTests[test] === true) {
      return true; // excluded implicitly
    }
  }
  return false;
}

// are we not in a group and there is an included group?
function useIsTopLevelWhenThereIsAnIncludedGroup(groupName?: string): boolean {
  if (!useHasIncludedGroups()) {
    return false;
  }

  // Return whether there's an included group, and we're not inside a group
  return !groupName;
}

function useHasIncludedGroups(): boolean {
  const exclusion = useExclusion();

  for (const group in exclusion.groups) {
    if (exclusion.groups[group]) {
      return true;
    }
  }
  return false;
}

const enum ExclusionGroup {
  ONLY,
  SKIP,
}
