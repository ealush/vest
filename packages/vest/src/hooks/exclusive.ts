import asArray from 'asArray';
import hasOwnProperty from 'hasOwnProperty';
import { isStringValue } from 'isStringValue';

import VestTest from 'VestTest';
import ctx from 'ctx';
import { ERROR_HOOK_CALLED_OUTSIDE } from 'hookErrors';

type TExclusionItem = string | string[] | undefined;

/**
 * Adds a field or multiple fields to inclusion group.
 */
export function only(item: TExclusionItem): void {
  return addTo(ExclusionGroup.ONLY, 'tests', item);
}

only.group = (item: TExclusionItem) =>
  addTo(ExclusionGroup.ONLY, 'groups', item);

/**
 * Adds a field or multiple fields to exclusion group.
 */
export function skip(item: TExclusionItem): void {
  return addTo(ExclusionGroup.SKIP, 'tests', item);
}

skip.group = (item: TExclusionItem) =>
  addTo(ExclusionGroup.SKIP, 'groups', item);

//Checks whether a certain test profile excluded by any of the exclusion groups.

// eslint-disable-next-line complexity, max-statements
export function isExcluded(testObject: VestTest): boolean {
  const { fieldName, groupName } = testObject;

  const context = ctx.useX();

  if (context.skipped) return true;

  const exclusion = context.exclusion;
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

  // if field is only'ed
  if (isTestIncluded) return false;

  // If there is _ANY_ `only`ed test (and we already know this one isn't) return true
  // Otherwise return false
  return hasIncludedTests(keyTests);
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
  for (const group in keyGroups) {
    // If any other group is only'ed
    if (keyGroups[group] === true) {
      return true;
    }
  }

  return false;
}

/**
 * Adds fields to a specified exclusion group.
 */
function addTo(
  exclusionGroup: ExclusionGroup,
  itemType: 'tests' | 'groups',
  item: TExclusionItem
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

const enum ExclusionGroup {
  ONLY,
  SKIP,
}
