import { RuleInstance, Passing } from 'enforceUtil';

export function optional<T>(
  rule: RuleInstance<T, any>,
): RuleInstance<T | undefined | null, [T | undefined | null]> {
  return {
    run: (value: T | undefined | null) => {
      if (value === undefined || value === null) {
        return Passing(value);
      }
      return rule.run(value);
    },
    infer: undefined as T | undefined | null,
  };
}
