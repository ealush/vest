import type { VestTestType } from './../../core/test/lib/VestTest';
import patch from '../../core/state/patch';
import singleton from '../../lib/singleton';
import throwError from '../../lib/throwError';
import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';
import {
  EXCLUSION_GROUP_NAME_ONLY,
  EXCLUSION_GROUP_NAME_SKIP,
  EXCLUSION_ITEM_TYPE_TESTS,
  EXCLUSION_ITEM_TYPE_GROUPS,
} from './constants';

type ExclusionGroupType =
  | typeof EXCLUSION_GROUP_NAME_ONLY
  | typeof EXCLUSION_GROUP_NAME_SKIP;

type ExclusionItemType =
  | typeof EXCLUSION_ITEM_TYPE_TESTS
  | typeof EXCLUSION_ITEM_TYPE_GROUPS;

type ItemType = string[] | string;

type KeyTests = {
  [fieldName: string]: boolean;
};

/**
 * Adds fields to a specified exclusion group.
 */
const addTo = (
  exclusionGroup: ExclusionGroupType,
  itemType: ExclusionItemType,
  item: ItemType
) => {
  const ctx = singleton.useContext();
  if (!item) {
    return;
  }

  if (ctx?.suiteId === undefined) {
    throwError(`${exclusionGroup} ${ERROR_HOOK_CALLED_OUTSIDE}`);
    return;
  }

  patch(ctx.suiteId, state => {
    const nextState = { ...state };

    // Flattens arrays + strings
    [].concat(item).forEach(itemName => {
      if (typeof itemName !== 'string') {
        return;
      }

      nextState.exclusion[itemType][itemName] =
        exclusionGroup === EXCLUSION_GROUP_NAME_ONLY;
    });

    return nextState;
  });
};

/**
 * Adds a field or multiple fields to inclusion group.
 */
const only = (item: ItemType) =>
  addTo(EXCLUSION_GROUP_NAME_ONLY, EXCLUSION_ITEM_TYPE_TESTS, item);

only.group = (item: ItemType) =>
  addTo(EXCLUSION_GROUP_NAME_ONLY, EXCLUSION_ITEM_TYPE_GROUPS, item);

/**
 * Adds a field or multiple fields to exclusion group.
 */
const skip = (item: ItemType) =>
  addTo(EXCLUSION_GROUP_NAME_SKIP, EXCLUSION_ITEM_TYPE_TESTS, item);

skip.group = (item: ItemType) =>
  addTo(EXCLUSION_GROUP_NAME_SKIP, EXCLUSION_ITEM_TYPE_GROUPS, item);

/**
 * Checks whether a certain test profile excluded by any of the exclusion groups.
 */
const isExcluded = (state: ISuiteState, testObject: VestTestType): boolean => {
  const { fieldName, groupName } = testObject;

  const keyTests = state.exclusion[EXCLUSION_ITEM_TYPE_TESTS];
  const testValue = keyTests[fieldName];

  // if test is skipped
  // no need to proceed
  if (testValue === false) {
    return true;
  }

  const isTestIncluded = testValue === true;

  // If inside a group
  if (groupName) {
    if (isGroupExcluded(state, groupName)) {
      return true; // field excluded by group

      // if group is `only`ed
    } else if (
      state.exclusion[EXCLUSION_ITEM_TYPE_GROUPS][groupName] === true
    ) {
      if (isTestIncluded) {
        return false;
      }

      // If there is _ANY_ `only`ed test (and we already know this one isn't)
      if (hasIncludedTests(keyTests)) {
        return true; // Excluded implicitly
      }

      return keyTests[fieldName] === false;
    }
  }

  // if field is only'ed
  if (isTestIncluded) {
    return false;
  }

  // If there is _ANY_ `only`ed test (and we already know this one isn't) return true
  // Otherwise return false
  return hasIncludedTests(keyTests);
};

/**
 * Checks if state has included tests
 */
const hasIncludedTests = (keyTests: KeyTests): boolean => {
  for (const test in keyTests) {
    if (keyTests[test] === true) {
      return true; // excluded implicitly
    }
  }
  return false;
};

/**
 * Checks whether a given group is excluded from running.
 */
const isGroupExcluded = (state: ISuiteState, groupName: string): boolean => {
  const keyGroups = state.exclusion[EXCLUSION_ITEM_TYPE_GROUPS];

  const groupPresent = Object.prototype.hasOwnProperty.call(
    keyGroups,
    groupName
  );

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
};

export { only, skip, isExcluded, isGroupExcluded };
