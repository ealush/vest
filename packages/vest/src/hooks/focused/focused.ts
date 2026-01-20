import {
  asArray,
  Maybe,
  OneOrMoreOf,
  noop,
  Nullable,
  isArray,
  isNotEmpty,
  isObject,
  isStringValue,
  makeBrand,
  makeResult,
  Result,
} from 'vest-utils';
import { IsolateSelectors, TIsolate, Isolate } from 'vestjs-runtime';

import { VestIsolateType } from '../../core/isolate/VestIsolateType';
import { TFieldName, TGroupName } from '../../suiteResult/SuiteResultTypes';

import { FocusModes } from './FocusedKeys';

export type FieldExclusion<F extends string = TFieldName> = Maybe<
  OneOrMoreOf<F>
>;
export type GroupExclusion<G extends string = TGroupName> = Maybe<
  OneOrMoreOf<G>
>;
export type FocusMatch<
  F extends string = TFieldName,
  G extends string = TGroupName,
> =
  | FieldExclusion<F>
  | {
      fields?: FieldExclusion<F>;
      groups?: GroupExclusion<G>;
    };

export type TIsolateFocused = TIsolate<IsolateFocusedPayload>;

type IsolateFocusedPayload = {
  focusMode: FocusModes;
  fields: TFieldName[];
  groups: TGroupName[];
  matchAll: boolean;
};

export function IsolateFocused(
  focusMode: FocusModes,
  match?: true | FocusMatch<string, string>,
): TIsolateFocused {
  const normalizedMatch = normalizeMatch(match);
  const matchedFields = normalizedMatch.fields;
  const matchedGroups = normalizedMatch.groups;

  return Isolate.create(VestIsolateType.Focused, noop, {
    fields: matchedFields,
    focusMode,
    groups: matchedGroups,
    matchAll: normalizedMatch.matchAll,
  });
}

export class FocusSelectors {
  static isFocusMatch(
    focus: Nullable<TIsolateFocused>,
    fieldName?: TFieldName,
    groupName?: TGroupName,
  ): Result<boolean> {
    return makeResult.Ok(hasFocus(focus, fieldName, groupName).unwrap());
  }

  static isSkipFocused(
    focus: Nullable<TIsolateFocused>,
    fieldName?: TFieldName,
    groupName?: TGroupName,
  ): Result<boolean> {
    return makeResult.Ok(
      focus?.data.focusMode === FocusModes.SKIP &&
        hasFocus(focus, fieldName, groupName).unwrap(),
    );
  }
  static isOnlyFocused(
    focus: Nullable<TIsolateFocused>,
    fieldName?: TFieldName,
    groupName?: TGroupName,
  ): Result<boolean> {
    return makeResult.Ok(
      focus?.data.focusMode === FocusModes.ONLY &&
        hasFocus(focus, fieldName, groupName).unwrap(),
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
export function only(match: FocusMatch<string, string> | false) {
  return IsolateFocused(FocusModes.ONLY, defaultMatch(match).unwrap());
}
/**
 * Adds a field or a list of fields into the exclusion list
 *
 * @example
 *
 * skip('username');
 */
export function skip(match: FocusMatch<string, string> | boolean) {
  return IsolateFocused(FocusModes.SKIP, defaultMatch(match).unwrap());
}

function defaultMatch(
  match: FocusMatch<string, string> | boolean,
): Result<FocusMatch<string, string> | true> {
  return makeResult.Ok(match === false ? [] : match);
}

// eslint-disable-next-line complexity
function hasFocus(
  focus: Nullable<TIsolateFocused>,
  fieldName?: TFieldName,
  groupName?: TGroupName,
): Result<boolean> {
  if (focus?.data.matchAll) {
    return makeResult.Ok(true);
  }

  const hasFieldMatch =
    isNotEmpty(focus?.data.fields) &&
    (fieldName ? (focus?.data.fields?.includes(fieldName) ?? true) : true);
  const hasGroupMatch =
    isNotEmpty(focus?.data.groups) &&
    (groupName ? (focus?.data.groups?.includes(groupName) ?? true) : true);

  return makeResult.Ok(
    (hasFieldMatch || hasGroupMatch) &&
      (fieldName || groupName
        ? true
        : isNotEmpty(focus?.data.fields) || isNotEmpty(focus?.data.groups)),
  );
}

function normalizeMatch(match: true | FocusMatch<string, string> | undefined): {
  fields: TFieldName[];
  groups: TGroupName[];
  matchAll: boolean;
} {
  if (match === true) {
    return {
      fields: [],
      groups: [],
      matchAll: true,
    };
  }

  let fieldsSource: FocusMatch<string, string> | undefined = match;
  let groupsSource: GroupExclusion<string> | undefined;

  if (isFocusGroupConfig(match)) {
    fieldsSource = match?.fields;
    groupsSource = match?.groups;
  }

  const fields = asArray(fieldsSource)
    .filter(isStringValue)
    .map(makeBrand<TFieldName>) as TFieldName[];
  const groups = asArray(groupsSource)
    .filter(isStringValue)
    .map(makeBrand<TGroupName>) as TGroupName[];

  return {
    fields,
    groups,
    matchAll: false,
  };
}

function isFocusGroupConfig(
  match: FocusMatch<string, string> | undefined,
): match is {
  fields?: FieldExclusion<string>;
  groups?: GroupExclusion<string>;
} {
  const candidate = getFocusGroupCandidate(match);
  return !!candidate && hasFocusGroupKeys(candidate);
}

function getFocusGroupCandidate(
  match: FocusMatch<string, string> | undefined,
): Record<string, unknown> | null {
  if (!isObject(match)) {
    return null;
  }

  if (isArray(match)) {
    return null;
  }

  if (isStringValue(match)) {
    return null;
  }

  return match;
}

function hasFocusGroupKeys(match: Record<string, unknown>): boolean {
  return 'fields' in match || 'groups' in match;
}
