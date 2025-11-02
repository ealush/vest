import { RuleInstance } from 'enforce';

export interface ValueRuleInstance<T = any> extends RuleInstance<T, [any]> {
  isValueOf(obj: Record<string, T>): ValueRuleInstance<T>;
  isNotValueOf(obj: Record<string, T>): ValueRuleInstance<T>;
}

export function isValueOf<T>(value: T, obj: Record<string, T>): boolean {
  return Object.values(obj).includes(value);
}

export function isNotValueOf<T>(value: T, obj: Record<string, T>): boolean {
  return !Object.values(obj).includes(value);
}

export const valueRules = {
  isNotValueOf,
  isValueOf,
};

export function checkValue(): boolean {
  return true;
}
