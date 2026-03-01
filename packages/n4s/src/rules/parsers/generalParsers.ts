import { RuleRunReturn } from '../../utils/RuleRunReturn';
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

export const toJSON = (value: string): RuleRunReturn<unknown> => {
  try {
    return RuleRunReturn.Passing(JSON.parse(value));
  } catch {
    return RuleRunReturn.Failing(value, 'Could not parse JSON');
  }
};

export const generalParsers = {
  defaultTo,
  toBoolean,
  toJSON,
} as const;
