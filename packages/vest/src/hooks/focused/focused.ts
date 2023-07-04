import { isStringValue, asArray, Maybe, OneOrMoreOf, noop } from 'vest-utils';
import { Isolate } from 'vestjs-runtime';

import { ErrorStrings } from 'ErrorStrings';
import { FocusKeys, FocusModes } from 'FocusedKeys';
import { useExclusion } from 'SuiteContext';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export type ExclusionItem = Maybe<OneOrMoreOf<string>>;
export type FieldExclusion<F extends TFieldName> = Maybe<OneOrMoreOf<F>>;
export type GroupExclusion<G extends TGroupName> = Maybe<OneOrMoreOf<G>>;

type FocusedPayload = {
  fieldNames?: FieldExclusion<TFieldName>;
  focusMode: FocusModes;
};

export class IsolateFocused extends Isolate<FocusedPayload> {
  type = VestIsolateType.Focused;
  focusMode: FocusModes;
  fieldNames: TFieldName[];

  constructor(payload: FocusedPayload) {
    super();

    this.focusMode = payload.focusMode;
    this.fieldNames = asArray(payload.fieldNames ?? []);
  }

  static only(fieldNames: FieldExclusion<TFieldName>) {
    IsolateFocused.create(noop, {
      fieldNames,
      focusMode: FocusModes.ONLY,
    });
  }

  static skip(fieldNames: FieldExclusion<TFieldName>) {
    IsolateFocused.create(noop, {
      fieldNames,
      focusMode: FocusModes.SKIP,
    });
  }
}

/**
 * Adds a field or a list of fields into the inclusion list
 *
 * @example
 *
 * only('username');
 */
// @vx-allow use-use
export function only<F extends TFieldName>(item: FieldExclusion<F>): void {
  IsolateFocused.only(item);
  return useAddTo(FocusModes.ONLY, FocusKeys.tests, item);
}

only.group = function group<G extends TGroupName>(item: GroupExclusion<G>) {
  return useAddTo(FocusModes.ONLY, FocusKeys.groups, item);
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
  IsolateFocused.skip(item);
  return useAddTo(FocusModes.SKIP, FocusKeys.tests, item);
}

skip.group = function group<G extends TGroupName>(item: GroupExclusion<G>) {
  return useAddTo(FocusModes.SKIP, FocusKeys.groups, item);
};

/**
 * Adds fields to a specified exclusion group.
 */
function useAddTo(
  focusedGroup: FocusModes,
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

    exclusion[itemType][itemName] = focusedGroup === FocusModes.ONLY;
  });
}
