import {
  asArray,
  Maybe,
  Nullish,
  OneOrMoreOf,
  noop,
  isNotEmpty,
  isStringValue,
} from 'vest-utils';

import { IsolateTransient } from './IsolateTransient';
import { TIsolate } from './Isolate';
import { IsolateKeys } from './IsolateKeys';

export const VestIsolateTypeFocused = 'Focused';

export enum FocusModes {
  SKIP = 'skip',
  ONLY = 'only',
}

export type FocusMatchExclusion = Maybe<OneOrMoreOf<string>>;

export type TIsolateFocused = TIsolate<IsolateFocusedPayload>;

type IsolateFocusedPayload = {
  focusMode: FocusModes;
  match: FocusMatchExclusion;
  matchAll: boolean;
};

/**
 * Creates a focused isolate.
 * Focused isolates are transient because they only affect the current run
 * and do not need to be preserved in history or appearing in the suite result.
 */
export function IsolateFocused(
  focusMode: FocusModes,
  match?: true | FocusMatchExclusion,
): TIsolateFocused | undefined {
  const matchedFields = asArray(match).filter(isStringValue).filter(isNotEmpty);

  const matchAll = match === true;

  // If there are no fields to match and matchAll is false,
  // skip creating the isolate entirely — it would be a no-op.
  if (!isNotEmpty(matchedFields) && !matchAll) {
    return undefined;
  }

  return IsolateTransient<IsolateFocusedPayload>(noop, VestIsolateTypeFocused, {
    focusMode,
    match: matchedFields,
    matchAll,
  });
}

export class FocusSelectors {
  static isSkipFocused(
    focus: Nullish<TIsolateFocused>,
    fieldName?: string,
  ): boolean {
    if (!focus) return false;
    const data = focus.data;
    if (!data || data.focusMode !== FocusModes.SKIP) return false;
    if (data.matchAll) return true;
    return hasFocus(focus, fieldName);
  }
  static isOnlyFocused(
    focus: Nullish<TIsolateFocused>,
    fieldName?: string,
  ): boolean {
    if (!focus) return false;
    const data = focus.data;
    if (!data || data.focusMode !== FocusModes.ONLY) return false;
    if (data.matchAll) return true;
    return hasFocus(focus, fieldName);
  }

  static isIsolateFocused(isolate: TIsolate): isolate is TIsolateFocused {
    return isolate[IsolateKeys.Type] === VestIsolateTypeFocused;
  }
}

function hasFocus(
  focus: Nullish<TIsolateFocused>,
  fieldName?: string,
): boolean {
  const match = asArray(focus?.data?.match);
  if (!match.length) return false;

  return !fieldName || match.includes(fieldName as string);
}
