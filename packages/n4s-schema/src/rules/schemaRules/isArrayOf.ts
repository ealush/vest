import { ctx } from 'enforceContext';
import { mapFirst } from 'vest-utils';

import { Failing, Passing, RuleRunReturn } from 'enforceUtil';
import type { RuleInstance } from 'enforceUtil';

// eslint-disable-next-line max-nested-callbacks
export function isArrayOf<T>(value: T[], ...rules: any[]): RuleRunReturn<T[]> {
  if (!Array.isArray(value)) {
    return Failing(value);
  }

  return (
    mapFirst(value, (item, breakout, index) => {
      const res = ctx.run({ value: item, set: true, meta: { index } }, () => {
        // Try each rule with the item - any rule passing is OK
        const anyPass = rules.some(rule => rule.run(item).pass);
        return anyPass ? Passing(item) : Failing(item);
      });
      breakout(!res.pass, res);
    }) || Passing(value)
  );
}

// Type colocated with isArrayOf
export type InferShape<T> = T extends RuleInstance<infer R, any> ? R : never;
export type MultiTypeInput<T extends RuleInstance<any, any>[]> =
  InferShape<T[number]> extends never ? unknown : InferShape<T[number]>;
