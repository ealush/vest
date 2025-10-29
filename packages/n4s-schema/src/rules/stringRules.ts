import { isStringValue } from 'vest-utils';

import { RuleInstance } from '../enforce';

import { genRuleChain } from './genRuleChain';

export interface StringRuleInstance extends RuleInstance<string, [any]> {
  startsWith(start: string): StringRuleInstance;
  endsWith(ending: string): StringRuleInstance;
  matches(regex: RegExp): StringRuleInstance;
  minLength(n: number): StringRuleInstance;
  maxLength(n: number): StringRuleInstance;
}

function startsWith(str: string, start: string): boolean {
  return str.startsWith(start);
}

function endsWith(str: string, ending: string): boolean {
  return str.endsWith(ending);
}

function matches(str: string, regex: RegExp): boolean {
  return regex.test(str);
}

function minLength(str: string, n: number): boolean {
  return str.length >= n;
}

function maxLength(str: string, n: number): boolean {
  return str.length < n;
}

const rules = {
  endsWith,
  isString,
  matches,
  maxLength,
  minLength,
  startsWith,
};

export function isString(): StringRuleInstance {
  const add = genRuleChain<StringRuleInstance>(rules);
  return add(value => isStringValue(value));
}
