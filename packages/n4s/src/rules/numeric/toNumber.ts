import { toNumber as toNumberValue } from 'vest-utils';

import { RuleRunReturn } from '../../utils/RuleRunReturn';

export function toNumber(value: unknown): RuleRunReturn<number> {
  const result = toNumberValue(value);

  if (result.type === 'err') {
    return RuleRunReturn.Failing(NaN, result.error);
  }

  return RuleRunReturn.Passing(result.value);
}
