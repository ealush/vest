import { RuleInstance } from '../RuleInstance';
import { describe, it, expect } from 'vitest';

import { RuleRunReturn } from '../RuleRunReturn';

describe('RuleInstance.create', () => {
  it('wraps a rule function and returns pass/fail correctly', () => {
    type R = RuleInstance<number, [number, number]>;

    const greaterThan = (a: number, b: number) =>
      RuleRunReturn.create(a > b, a);

    const rule = RuleInstance.create<R, number, [number, number]>(greaterThan);

    expect(rule.run(5, 3).pass).toBe(true);
    expect(rule.run(3, 5).pass).toBe(false);
  });

  it('preserves messages when provided by the rule', () => {
    type R = RuleInstance<string, [string]>;

    const nonEmpty = (s: string) =>
      s.trim().length > 0
        ? RuleRunReturn.Passing(s, 'ok')
        : RuleRunReturn.Failing(s, 'empty');

    const rule = RuleInstance.create<R, string, [string]>(nonEmpty);

    expect(rule.run('hello').message).toBe('ok');
    expect(rule.run('   ').message).toBe('empty');
  });
});
