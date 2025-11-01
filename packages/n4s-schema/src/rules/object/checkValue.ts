import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface ValueRuleInstance<T = any> extends RuleInstance<T, [any]> {
  isValueOf(obj: Record<string, T>): ValueRuleInstance<T>;
  isNotValueOf(obj: Record<string, T>): ValueRuleInstance<T>;
}

function isValueOf<T>(value: T, obj: Record<string, T>): boolean {
  return Object.values(obj).includes(value);
}

function isNotValueOf<T>(value: T, obj: Record<string, T>): boolean {
  return !Object.values(obj).includes(value);
}

const valueRules = {
  isNotValueOf,
  isValueOf,
};

function passThrough(): boolean {
  return true;
}

export function checkValue<T = any>(): ValueRuleInstance<T> {
  const add = genRuleChain<ValueRuleInstance<T>>(valueRules as any);
  return add(passThrough);
}
