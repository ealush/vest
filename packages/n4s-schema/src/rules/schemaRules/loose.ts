import { ctx } from 'enforceContext';
import type { ShapeType } from 'shape';

import type { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';

export function loose<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): RuleRunReturn<T> {
  for (const key in schema) {
    const fieldValue = key in value ? value[key] : undefined;
    const res = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
      schema[key].run(fieldValue),
    );
    if (!res.pass) {
      return res as RuleRunReturn<T>;
    }
  }
  return RuleRunReturn.Passing(value);
}

// Types colocated with loose rule
export type LooseRuleInstance<S extends Record<string, RuleInstance<any>>> =
  RuleInstance<
    ShapeType<S> & Record<string, unknown>,
    [ShapeType<S> & Record<string, unknown>]
  >;

export type LooseShapeValue<S extends Record<string, RuleInstance<any>>> =
  ShapeType<S> & Record<string, unknown>;

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface ValueFirstRules {
      loose: <T extends Record<string, any>>(
        value: T,
        schema: Record<string, RuleInstance<any>>,
      ) => RuleRunReturn<T>;
    }
  }
}
