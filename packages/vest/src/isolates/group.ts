/**
 * Module: `src/isolates/group.ts`.
 *
 * Provides `group`-related runtime and type utilities used by `vest`.
 */
import { CB, makeBrand, isNotEmptySet } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

import { SuiteContext } from '../core/context/SuiteContext';
import {
  createVestIsolate,
  TVestIsolate,
  VestIsolateType,
} from '../core/isolate/VestIsolateType';
import { skip } from '../hooks/focused/focused';
import { TGroupName } from '../suiteResult/SuiteResultTypes';

export function group(groupName: string, callback: CB<void>): TIsolate;
export function group(callback: CB<void>): TIsolate;
export function group(
  ...args: [groupName: string, callback: CB<void>] | [callback: CB<void>]
): TIsolateGroup<TGroupName> {
  const [callback, groupName] = args.reverse() as [
    CB<void>,
    string | undefined,
  ];
  const safeGroupName =
    groupName === undefined ? undefined : makeBrand<TGroupName>(groupName);

  return createVestIsolate(
    VestIsolateType.Group,
    () => {
      // When `skipGroup` is set via `suite.focus({ skipGroup: ... })`, inject
      // a `skip(true)` call at the top of the matching group's callback.
      // This creates a transient Focused isolate inside the group scope with
      // `matchAll: true`, causing all tests in this group to be excluded.
      // Because the isolate is transient, it is not persisted in the suite
      // state and adds zero overhead between runs.
      if (groupName && shouldSkipGroup(groupName)) {
        skip(true);
      }
      callback();
    },
    {
      groupName: safeGroupName as TGroupName,
    },
  );
}

/**
 * Evaluates whether an entire group should be skipped based on `suite.focus()` modifiers.
 *
 * This function enforces the precedence rules: `skipGroup` > `onlyGroup`.
 *
 * 1. If `skipGroup` contains the group name, it is unconditionally skipped (destructive block-list).
 * 2. If `onlyGroup` is active (has items), and the group name is NOT in it, it is skipped (constructive allow-list).
 * 3. Otherwise, the group is allowed to run.
 *
 * @param {string} groupName - The name of the group being evaluated.
 * @returns {boolean} `true` if the group should be skipped, `false` otherwise.
 */
function shouldSkipGroup(groupName: string): boolean {
  const { modifiers } = SuiteContext.useX();

  // 1. Destructive block-list takes absolute precedence
  if (
    isNotEmptySet(modifiers.skipGroup) &&
    modifiers.skipGroup.has(groupName)
  ) {
    return true;
  }

  // 2. Constructive allow-list pruning
  if (
    isNotEmptySet(modifiers.onlyGroup) &&
    !modifiers.onlyGroup.has(groupName)
  ) {
    return true;
  }

  return false;
}

export type TIsolateGroup<G extends TGroupName = TGroupName> = TVestIsolate<{
  groupName: G;
}>;
