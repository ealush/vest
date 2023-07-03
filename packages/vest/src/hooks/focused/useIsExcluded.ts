import { hasOwnProperty, optionalFunctionValue } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { useExclusion, useInclusion } from 'SuiteContext';
import { TGroupName } from 'SuiteResultTypes';
import { useIsExcludedIndividually } from 'skipWhen';
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
    return !optionalFunctionValue(inclusion[fieldName]);
  }

  // We're done here. This field is not excluded
  return false;
}

/**
 * Checks whether a given group is excluded from running.
 */
export function useIsGroupExcluded(groupName: TGroupName): boolean {
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
