/**
 * Module: `src/hooks/focused/focused.ts`.
 *
 * Provides `focused`-related runtime and type utilities used by `vest`.
 */
import { Maybe, OneOrMoreOf, Result, makeResult } from 'vest-utils';
import {
  IsolateFocused as VestRuntimeIsolateFocused,
  FocusModes,
  FocusSelectors,
  type TIsolateFocused,
} from 'vestjs-runtime';

import { TFieldName } from '../../suiteResult/SuiteResultTypes';

export { FocusModes, FocusSelectors, type TIsolateFocused };

export type FieldExclusion<F extends string = TFieldName> = Maybe<
  OneOrMoreOf<F>
>;

/**
 * Adds a field or a list of fields into the inclusion list
 *
 * @example
 *
 * only('username');
 */
export function only(match: FieldExclusion<string> | false) {
  return VestRuntimeIsolateFocused(
    FocusModes.ONLY,
    defaultMatch(match).unwrap(),
  );
}
/**
 * Adds a field or a list of fields into the exclusion list
 *
 * @example
 *
 * skip('username');
 */
export function skip(match: FieldExclusion<string> | boolean) {
  return VestRuntimeIsolateFocused(
    FocusModes.SKIP,
    defaultMatch(match).unwrap(),
  );
}

function defaultMatch(
  match: FieldExclusion<string> | boolean,
): Result<FieldExclusion<string> | true> {
  return makeResult.Ok(match === false ? [] : match);
}
