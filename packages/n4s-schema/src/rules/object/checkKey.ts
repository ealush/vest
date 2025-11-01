import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

export interface ObjectRuleInstance extends RuleInstance<object, [object]> {
  isKeyOf(obj: object): ObjectRuleInstance;
  isNotKeyOf(obj: object): ObjectRuleInstance;
}

function isKeyOf<T extends object>(key: string | number, obj: T): boolean {
  return obj != null && typeof obj === 'object' && String(key) in obj;
}

function isNotKeyOf<T extends object>(key: string | number, obj: T): boolean {
  return !(obj != null && typeof obj === 'object' && String(key) in obj);
}

const keyRules = {
  isKeyOf,
  isNotKeyOf,
};

function passThrough(): boolean {
  return true;
}

export function checkKey(): ObjectRuleInstance {
  const add = genRuleChain<ObjectRuleInstance>(keyRules);
  return add(passThrough);
}
