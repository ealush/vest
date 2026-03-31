import { isObject, mapFirst } from 'vest-utils';

import { ctx } from '../../enforceContext';
import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

import {
  findDangerousOwnKey,
  ownKeys,
  safeShallowCopy,
} from './schemaObjectUtils';
import type { InferShapeInput } from './schemaRulesTypes';

/**
 * Validates that an object's dynamic keys and/or values match provided rules.
 * Like TypeScript's Record<K, V>, it checks elements against shape rules.
 *
 * @param value - The object to validate
 * @param arg1 - Either the key rule (if arg2 is present) or the value rule
 * @param arg2 - The value rule (if arg1 is the key rule)
 * @returns RuleRunReturn indicating success or failure
 */
export function record<T extends Record<string, any>>(
  value: T,
  arg1: any,
  arg2?: any,
): RuleRunReturn<T> {
  if (!isObject(value) || Array.isArray(value))
    return RuleRunReturn.Failing(value);

  const rules = parseRules(arg1, arg2);
  const dangerousKey = findDangerousOwnKey(value);
  if (dangerousKey)
    return createRecordFailure(
      value,
      dangerousKey,
      RuleRunReturn.Failing(value),
    );

  const parsedValue: Record<string, any> = safeShallowCopy(value);

  const failingResult = mapFirst(ownKeys(value), (key, breakout) => {
    const errorRes = evaluateRecordEntry(key, value, rules, parsedValue);
    if (errorRes) {
      breakout(true, errorRes);
    }
  });

  return (
    (failingResult as RuleRunReturn<T>) ||
    RuleRunReturn.Passing(parsedValue as T)
  );
}

function parseRules(arg1: any, arg2?: any) {
  if (arg2 !== undefined) return { keyRule: arg1, valueRule: arg2 };
  return { keyRule: undefined, valueRule: arg1 };
}

function evaluateRecordEntry<T extends Record<string, any>>(
  key: string,
  value: T,
  rules: {
    keyRule?: RuleInstance<any, any>;
    valueRule: RuleInstance<any, any>;
  },
  parsedValue: Record<string, any>,
): RuleRunReturn<T> | void {
  if (rules.keyRule) {
    const keyRes = ctx.run({ value: key, set: true }, () =>
      rules.keyRule!.run(key),
    );
    if (!keyRes.pass) return createRecordFailure(value, key, keyRes);
  }

  const fieldValue = value[key];
  const valRes = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
    rules.valueRule.run(fieldValue),
  );

  if (!valRes.pass) return createRecordFailure(value, key, valRes);

  parsedValue[key] = valRes.type;
}

function createRecordFailure<T extends Record<string, any>>(
  value: T,
  key: string,
  ruleRes: RuleRunReturn<any>,
): RuleRunReturn<T> {
  const currentPath = ruleRes.path || [];
  const newRes = RuleRunReturn.Failing(value, ruleRes.message);
  newRes.path = [key, ...currentPath];
  return newRes as RuleRunReturn<T>;
}

export type RecordRuleInstance<
  _K,
  V extends RuleInstance<any, any>,
> = RuleInstance<
  Record<string, V['infer']>,
  [Record<string, InferShapeInput<V>>]
>;
