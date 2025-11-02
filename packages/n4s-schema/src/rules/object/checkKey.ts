import { RuleInstance } from 'enforce';

export interface ObjectRuleInstance extends RuleInstance<object, [object]> {
  isKeyOf(obj: object): ObjectRuleInstance;
  isNotKeyOf(obj: object): ObjectRuleInstance;
}

export function isKeyOf<T extends object>(
  key: string | number | symbol,
  obj: T,
): boolean {
  return (
    obj != null &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, key)
  );
}

export function isNotKeyOf<T extends object>(
  key: string | number | symbol,
  obj: T,
): boolean {
  return !(
    obj != null &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, key)
  );
}

export function checkKey(): boolean {
  return true;
}
