import { RuleInstance } from 'enforce';

export interface ObjectRuleInstance extends RuleInstance<object, [object]> {
  isKeyOf(obj: object): ObjectRuleInstance;
  isNotKeyOf(obj: object): ObjectRuleInstance;
}

function isKeyOf<T extends object>(
  key: string | number | symbol,
  obj: T,
): boolean {
  return (
    obj != null &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, key)
  );
}

function isNotKeyOf<T extends object>(
  key: string | number | symbol,
  obj: T,
): boolean {
  return !(
    obj != null &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, key)
  );
}

export const keyRules = {
  isKeyOf,
  isNotKeyOf,
};

export function checkKey(): boolean {
  return true;
}
