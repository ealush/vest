import { ErrorStrings } from 'ErrorStrings';
import { isStringValue, asArray, Maybe, OneOrMoreOf } from 'vest-utils';

import { FocusKeys, FocusTypes } from 'FocusedKeys';
import { useExclusion } from 'SuiteContext';
import { TFieldName, TGroupName } from 'SuiteResultTypes';

export type ExclusionItem = Maybe<OneOrMoreOf<string>>;
export type FieldExclusion<F extends TFieldName> = Maybe<OneOrMoreOf<F>>;
export type GroupExclusion<G extends TGroupName> = Maybe<OneOrMoreOf<G>>;

/**
 * Adds a field or a list of fields into the inclusion list
 *
 * @example
 *
 * only('username');
 */
// @vx-allow use-use
export function only<F extends TFieldName>(item: FieldExclusion<F>): void {
  return useAddTo(FocusTypes.ONLY, FocusKeys.tests, item);
}

only.group = function group<G extends TGroupName>(item: GroupExclusion<G>) {
  return useAddTo(FocusTypes.ONLY, FocusKeys.groups, item);
};

/**
 * Adds a field or a list of fields into the exclusion list
 *
 * @example
 *
 * skip('username');
 */
// @vx-allow use-use
export function skip<F extends TFieldName>(item: FieldExclusion<F>): void {
  return useAddTo(FocusTypes.SKIP, FocusKeys.tests, item);
}

skip.group = function group<G extends TGroupName>(item: GroupExclusion<G>) {
  return useAddTo(FocusTypes.SKIP, FocusKeys.groups, item);
};

/**
 * Adds fields to a specified exclusion group.
 */
function useAddTo(
  focusedGroup: FocusTypes,
  itemType: FocusKeys,
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

    exclusion[itemType][itemName] = focusedGroup === FocusTypes.ONLY;
  });
}
