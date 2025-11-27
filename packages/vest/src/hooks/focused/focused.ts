import {
  asArray,
  Maybe,
  OneOrMoreOf,
  noop,
  Nullable,
  isNotEmpty,
  isStringValue,
  makeBrand,
} from 'vest-utils';
import { IsolateSelectors, TIsolate, Isolate } from 'vestjs-runtime';

import { VestIsolateType } from '../../core/isolate/VestIsolateType';
import { TFieldName } from '../../suiteResult/SuiteResultTypes';

import { FocusModes } from './FocusedKeys';

export type FieldExclusion<F extends string = TFieldName> = Maybe<
  OneOrMoreOf<F>
>;

export type TIsolateFocused = TIsolate<IsolateFocusedPayload>;

type IsolateFocusedPayload = {
  focusMode: FocusModes;
  match: FieldExclusion<TFieldName>;
  matchAll: boolean;
};

export function IsolateFocused(
  focusMode: FocusModes,
  match?: true | FieldExclusion<string>,
): TIsolateFocused {
  const matchedFields = asArray(match)
    .filter(isStringValue)
    .map(makeBrand<TFieldName>) as TFieldName[];

  return Isolate.create(VestIsolateType.Focused, noop, {
    focusMode,
    match: matchedFields,
    matchAll: match === true,
  });
}

export class FocusSelectors {
  static isSkipFocused(
    focus: Nullable<TIsolateFocused>,
    fieldName?: TFieldName,
  ): boolean {
    return (
      focus?.data.focusMode === FocusModes.SKIP &&
      (hasFocus(focus, fieldName) || focus.data.matchAll === true)
    );
  }
  static isOnlyFocused(
    focus: Nullable<TIsolateFocused>,
    fieldName?: TFieldName,
  ): boolean {
    return (
      focus?.data.focusMode === FocusModes.ONLY && hasFocus(focus, fieldName)
    );
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
export function only(match: FieldExclusion<string> | false) {
  return IsolateFocused(FocusModes.ONLY, defaultMatch(match));
}
/**
 * Adds a field or a list of fields into the exclusion list
 *
 * @example
 *
 * skip('username');
 */
export function skip(match: FieldExclusion<string> | boolean) {
  return IsolateFocused(FocusModes.SKIP, defaultMatch(match));
}

function defaultMatch(match: FieldExclusion<string> | boolean) {
  return match === false ? [] : match;
}

function hasFocus(focus: Nullable<TIsolateFocused>, fieldName?: TFieldName) {
  return (
    isNotEmpty(focus?.data.match) &&
    (fieldName ? focus?.data.match?.includes(fieldName) ?? true : true)
  );
}
