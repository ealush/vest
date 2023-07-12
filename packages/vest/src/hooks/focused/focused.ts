import {
  asArray,
  Maybe,
  OneOrMoreOf,
  noop,
  Nullable,
  isNotEmpty,
  isStringValue,
} from 'vest-utils';
import { IsolateSelectors, TIsolate, Isolate } from 'vestjs-runtime';

import { FocusModes } from 'FocusedKeys';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export type ExclusionItem = Maybe<OneOrMoreOf<string>>;
export type FieldExclusion<F extends TFieldName> = Maybe<OneOrMoreOf<F>>;
export type GroupExclusion<G extends TGroupName> = Maybe<OneOrMoreOf<G>>;

export type TIsolateFocused = TIsolate & {
  focusMode: FocusModes;
  match: FieldExclusion<TFieldName>;
  matchAll: boolean;
};

export function IsolateFocused(
  focusMode: FocusModes,
  match?: true | FieldExclusion<TFieldName>
): TIsolateFocused {
  return Isolate.create(VestIsolateType.Focused, noop, {
    focusMode,
    match: asArray(match).filter(isStringValue),
    matchAll: match === true,
  });
}

export class FocusSelectors {
  static isSkipFocused(
    focus: Nullable<TIsolateFocused>,
    fieldName?: TFieldName
  ): boolean {
    return (
      focus?.focusMode === FocusModes.SKIP &&
      (hasFocus(focus, fieldName) || focus.matchAll === true)
    );
  }
  static isOnlyFocused(
    focus: Nullable<TIsolateFocused>,
    fieldName?: TFieldName
  ): boolean {
    return focus?.focusMode === FocusModes.ONLY && hasFocus(focus, fieldName);
  }

  static isIsolateFocused(isolate: TIsolate): isolate is TIsolateFocused {
    return IsolateSelectors.isIsolateType(isolate, VestIsolateType.Focused);
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
export function only(match: FieldExclusion<TFieldName> | false) {
  return IsolateFocused(FocusModes.ONLY, defaultMatch(match));
}
/**
 * Adds a field or a list of fields into the exclusion list
 *
 * @example
 *
 * skip('username');
 */
// @vx-allow use-use
export function skip(match: FieldExclusion<TFieldName> | boolean) {
  return IsolateFocused(FocusModes.SKIP, defaultMatch(match));
}

function defaultMatch(match: FieldExclusion<TFieldName> | boolean) {
  return match === false ? [] : match;
}

function hasFocus(focus: Nullable<TIsolateFocused>, fieldName?: TFieldName) {
  return (
    isNotEmpty(focus?.match) &&
    (fieldName ? focus?.match?.includes(fieldName) ?? true : true)
  );
}
