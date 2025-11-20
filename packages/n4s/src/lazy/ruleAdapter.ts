import { ctx } from '../enforceContext';
import { addToChain } from '../rules/genRuleChain';
import { RuleInstance } from '../utils/RuleInstance';
import { RuleRunReturn } from '../utils/RuleRunReturn';

export function adaptDynamicRules<
  T extends RuleInstance<any, [any]>,
  O extends Record<string, (...args: any[]) => any>,
>(container: O): Record<keyof typeof container, (...args: any[]) => T> {
  return Object.keys(container).reduce(
    (acc, key) => {
      (acc as any)[key] = (...args: any[]) =>
        addToChain({}, (value: any) => {
          // eslint-disable-next-line max-nested-callbacks
          const result = ctx.run({ value }, () =>
            (container as any)[key](value, ...args),
          );
          return RuleRunReturn.create(result, value);
        });
      return acc;
    },
    {} as Record<keyof typeof container, (...args: any[]) => T>,
  );
}
