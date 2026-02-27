/**
 * Module: `src/rules/numeric/toNumber.ts`.
 *
 * Provides `toNumber`-related runtime and type utilities used by `n4s`.
 */
import { isFailure, toNumber as toNumberValue } from 'vest-utils';

import { RuleRunReturn } from '../../utils/RuleRunReturn';

export function toNumber(value: unknown): RuleRunReturn<number> {
  const result = toNumberValue(value);

  if (isFailure(result)) {
    return RuleRunReturn.Failing(NaN, result.error);
  }

  return RuleRunReturn.Passing(result.value);
}
