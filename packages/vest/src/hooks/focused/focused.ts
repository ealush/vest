import {
  asArray,
  Maybe,
  OneOrMoreOf,
  noop,
  Nullable,
  isNotEmpty,
} from 'vest-utils';
import { Isolate } from 'vestjs-runtime';

import { FocusModes } from 'FocusedKeys';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export type ExclusionItem = Maybe<OneOrMoreOf<string>>;
export type FieldExclusion<F extends TFieldName> = Maybe<OneOrMoreOf<F>>;
export type GroupExclusion<G extends TGroupName> = Maybe<OneOrMoreOf<G>>;

type FocusedPayload = {
  match?: true | FieldExclusion<TFieldName>;
  focusMode: FocusModes;
};

export class IsolateFocused extends Isolate<FocusedPayload> {
  type = VestIsolateType.Focused;
  focusMode: FocusModes;
  match: TFieldName[] = [];
  matchAll = false;

  constructor(payload: FocusedPayload) {
    super();

    this.focusMode = payload.focusMode;

    if (payload.match === true) {
      this.matchAll = true;
      return;
    }

    this.match = asArray(payload.match ?? this.match);
  }

  static only(match: FieldExclusion<TFieldName> | false) {
    IsolateFocused.create(noop, {
      match: match === false ? [] : match,
      focusMode: FocusModes.ONLY,
    });
  }

  static skip(match: FieldExclusion<TFieldName> | boolean) {
    IsolateFocused.create(noop, {
      match: match === false ? [] : match,
      focusMode: FocusModes.SKIP,
    });
  }

  private static hasFocus(
    focus: Nullable<IsolateFocused>,
    fieldName?: TFieldName
  ) {
    return (
      isNotEmpty(focus?.match) &&
      (fieldName ? focus?.match?.includes(fieldName) ?? true : true)
    );
  }

  static isSkipFocused(
    focus: Nullable<IsolateFocused>,
    fieldName?: TFieldName
  ): boolean {
    return (
      focus?.focusMode === FocusModes.SKIP &&
      (IsolateFocused.hasFocus(focus, fieldName) || focus.matchAll === true)
    );
  }

  static isOnlyFocused(
    focus: Nullable<IsolateFocused>,
    fieldName?: TFieldName
  ): boolean {
    return (
      focus?.focusMode === FocusModes.ONLY &&
      IsolateFocused.hasFocus(focus, fieldName)
    );
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
export const only = IsolateFocused.only;
/**
 * Adds a field or a list of fields into the exclusion list
 *
 * @example
 *
 * skip('username');
 */
// @vx-allow use-use
export const skip = IsolateFocused.skip;
