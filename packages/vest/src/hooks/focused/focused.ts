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
 * A field selector for suite-level focus/lifecycle APIs. Literal field
 * names keep autocomplete; any other string is also accepted (broad-string
 * contract) because nested dotted paths (`profile.state`) and root-index
 * spellings are runtime data, not compile-time keys. `$` paths are
 * explicitly not typo-safe by documentation. Prefer this over bare `F`
 * wherever the runtime observes names beyond the top-level vocabulary.
 */
export type FieldSelector<F extends string = TFieldName> = F | (string & {});

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
