import { RuleInstance } from '../enforce';

import { genRuleChain } from './genRuleChain';

export interface ObjectRuleInstance extends RuleInstance<object, [object]> {
  isKeyOf(obj: object): ObjectRuleInstance;
  isNotKeyOf(obj: object): ObjectRuleInstance;
}

export interface ValueRuleInstance<T = any> extends RuleInstance<T, [any]> {
  isValueOf(obj: Record<string, T>): ValueRuleInstance<T>;
  isNotValueOf(obj: Record<string, T>): ValueRuleInstance<T>;
}

function isKeyOf<T extends object>(key: string | number, obj: T): boolean {
  return obj != null && typeof obj === 'object' && String(key) in obj;
}

function isNotKeyOf<T extends object>(key: string | number, obj: T): boolean {
  return !(obj != null && typeof obj === 'object' && String(key) in obj);
}

function isValueOf<T>(value: T, obj: Record<string, T>): boolean {
  return Object.values(obj).includes(value);
}

function isNotValueOf<T>(value: T, obj: Record<string, T>): boolean {
  return !Object.values(obj).includes(value);
}

const keyRules = {
  isKeyOf,
  isNotKeyOf,
};

const valueRules = {
  isValueOf,
  isNotValueOf,
};

export function checkKey(): ObjectRuleInstance {
  const add = genRuleChain<ObjectRuleInstance>(keyRules);
  function passThrough(): boolean {
    return true;
  }
  return add(passThrough); // Pass through, actual check happens in methods
}

export function checkValue<T = any>(): ValueRuleInstance<T> {
  const add = genRuleChain<ValueRuleInstance<T>>(valueRules as any);
  function passThrough(): boolean {
    return true;
  }
  return add(passThrough); // Pass through, actual check happens in methods
}
