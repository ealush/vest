import { RuleInstance } from 'RuleInstance';

export interface ArrayRuleInstance<T = any> extends RuleInstance<T[], [T[]]> {
  equals(arr: T[]): ArrayRuleInstance<T>;
  notEquals(arr: T[]): ArrayRuleInstance<T>;
  minLength(n: number): ArrayRuleInstance<T>;
  maxLength(n: number): ArrayRuleInstance<T>;
  lengthEquals(n: number): ArrayRuleInstance<T>;
  lengthNotEquals(n: number): ArrayRuleInstance<T>;
  longerThan(n: number): ArrayRuleInstance<T>;
  longerThanOrEquals(n: number): ArrayRuleInstance<T>;
  shorterThan(n: number): ArrayRuleInstance<T>;
  shorterThanOrEquals(n: number): ArrayRuleInstance<T>;
  includes(item: T): ArrayRuleInstance<T>;
  inside(container: T[]): ArrayRuleInstance<T>;
  notInside(container: T[]): ArrayRuleInstance<T>;
  isEmpty(): ArrayRuleInstance<T>;
  isNotEmpty(): ArrayRuleInstance<T>;
}

export function isArray(value: any): boolean {
  return Array.isArray(value);
}
