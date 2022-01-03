import asArray from 'asArray';
import hasOwnProperty from 'hasOwnProperty';
import { isStringValue } from 'isStringValue';
import optionalFunctionValue from 'optionalFunctionValue';

import VestTest from 'VestTest';
import ctx from 'ctx';
import { ERROR_HOOK_CALLED_OUTSIDE } from 'hookErrors';

type TExclusionItem = string | string[] | undefined;

/**
 * Adds a field or a list of fields into the inclusion list
 *
 * @example
 *
 * only('username');
 */
export function only(item: TExclusionItem): void {
  return addTo(ExclusionGroup.ONLY, 'tests', item);
}

only.group = (item: TExclusionItem) =>
  addTo(ExclusionGroup.ONLY, 'groups', item);

/**
 * Adds a field or a list of fields into the exclusion list
 *
 * @example
 *
 * skip('username');
 */
export function skip(item: TExclusionItem): void {
  return addTo(ExclusionGroup.SKIP, 'tests', item);
}

skip.group = (item: TExclusionItem) =>
  addTo(ExclusionGroup.SKIP, 'groups', item);

export function isExcludedIndividually(): boolean {
  return !!ctx.useX().skipped;
}

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

  if (isMissingFromIncludedGroup(groupName)) {
    return true;
  }

  // if field is only'ed
  if (isTestIncluded) return false;

  // If there is _ANY_ `only`ed test (and we already know this one isn't) return true
  if (hasIncludedTests(keyTests)) {
    // Check if inclusion rules for this field (`include` hook)
    return !optionalFunctionValue(inclusion[fieldName]);
  }

  // We're done here. This field is not excluded
  return false;
}

// eslint-disable-next-line max-statements
function isMissingFromIncludedGroup(groupName?: string): boolean {
  const context = ctx.useX();
  const exclusion = context.exclusion;

  if (!hasIncludedGroups()) {
    return false;
  }

  if (!groupName) {
    return true;
  }

  if (groupName in exclusion.groups) {
    if (exclusion.groups[groupName]) {
      return false;
    }
    return true;
  }

  return true;
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
