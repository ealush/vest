import {
  isStringValue,
  asArray,
  hasOwnProperty,
  optionalFunctionValue,
} from 'vest-utils';

import VestTest from 'VestTest';
import ctx from 'ctx';
import { ERROR_HOOK_CALLED_OUTSIDE } from 'hookErrors';
import { isExcludedIndividually } from 'skipWhen';

type ExclusionItem = string | string[] | undefined;

/**
 * Adds a field or a list of fields into the inclusion list
 *
 * @example
 *
 * only('username');
 */
export function only(item: ExclusionItem): void {
  return addTo(ExclusionGroup.ONLY, 'tests', item);
}

only.group = (item: ExclusionItem) =>
  addTo(ExclusionGroup.ONLY, 'groups', item);

/**
 * Adds a field or a list of fields into the exclusion list
 *
 * @example
 *
 * skip('username');
 */
export function skip(item: ExclusionItem): void {
  return addTo(ExclusionGroup.SKIP, 'tests', item);
}

skip.group = (item: ExclusionItem) =>
  addTo(ExclusionGroup.SKIP, 'groups', item);

//Checks whether a certain test profile excluded by any of the exclusion groups.

// eslint-disable-next-line complexity, max-statements, max-lines-per-function
export function isExcluded(testObject: VestTest): boolean {
  const { fieldName, groupName } = testObject;

  if (isExcludedIndividually()) return true;

  const context = ctx.useX();

  const exclusion = context.exclusion;
  const inclusion = context.inclusion;
  const keyTests = exclusion.tests;
  const testValue = keyTests[fieldName];

  // if test is skipped
  // no need to proceed
  if (testValue === false) return true;

  const isTestIncluded = testValue === true;

  // If inside a group
  if (groupName) {
    if (isGroupExcluded(groupName)) {
      return true; // field excluded by group

      // if group is `only`ed
    } else if (exclusion.groups[groupName] === true) {
      if (isTestIncluded) return false;

      // If there is _ANY_ `only`ed test (and we already know this one isn't)
      if (hasIncludedTests(keyTests)) return true; // Excluded implicitly

      return keyTests[fieldName] === false;
    }
  }

  if (isTopLevelWhenThereIsAnIncludedGroup(groupName)) {
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
export function isGroupExcluded(groupName: string): boolean {
  const context = ctx.useX();
  const exclusion = context.exclusion;
  const keyGroups = exclusion.groups;

  const groupPresent = hasOwnProperty(keyGroups, groupName);

  // When group is either only'ed or skipped
  if (groupPresent) {
    // Return true if group is skipped and false if only'ed
    return keyGroups[groupName] === false;
  }

  // Group is not present

  // Return whether other groups are included
  return hasIncludedGroups();
}

/**
 * Adds fields to a specified exclusion group.
 */
function addTo(
  exclusionGroup: ExclusionGroup,
  itemType: 'tests' | 'groups',
  item: ExclusionItem
) {
  const context = ctx.useX(ERROR_HOOK_CALLED_OUTSIDE);

  if (!item) {
    return;
  }

  asArray(item).forEach((itemName: string): void => {
    if (!isStringValue(itemName)) {
      return;
    }

    context.exclusion[itemType][itemName] =
      exclusionGroup === ExclusionGroup.ONLY;
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
function isTopLevelWhenThereIsAnIncludedGroup(groupName?: string): boolean {
  if (!hasIncludedGroups()) {
    return false;
  }

  // Return whether there's an included group, and we're not inside a group
  return !groupName;
}

function hasIncludedGroups(): boolean {
  const context = ctx.useX();
  const exclusion = context.exclusion;

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
