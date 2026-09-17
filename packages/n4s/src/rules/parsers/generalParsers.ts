import { RuleRunReturn } from '../../utils/RuleRunReturn';
import { CHAIN_PREPEND, registerParserRules } from './parserUtils';
import { toBoolean } from './toBoolean';

export function defaultTo<TValue>(
  value: TValue,
  fallback: NonNullable<TValue>,
): RuleRunReturn<NonNullable<TValue>> {
  if (value == null) {
    return RuleRunReturn.Passing(fallback);
  }

  return RuleRunReturn.Passing(value as NonNullable<TValue>);
}

(defaultTo as unknown as Record<symbol, boolean>)[CHAIN_PREPEND] = true;

export const parseJSON = (value: string): RuleRunReturn<unknown> => {
  try {
    return RuleRunReturn.Passing(JSON.parse(value));
  } catch {
    return RuleRunReturn.Failing(value, 'Could not parse JSON');
  }
};

export const generalParsers = {
  defaultTo,
  parseJSON,
  toBoolean,
} as const;

registerParserRules(generalParsers);
