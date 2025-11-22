import { describe, expect, it } from 'vitest';

import { enforce } from '../../../n4s';

const runRule = <TRule extends { run: (..._args: any[]) => any }>(
  rule: TRule,
  value: unknown,
) =>
  (rule as TRule & { run: (_value: unknown) => ReturnType<TRule['run']> }).run(
    value,
  );

describe('nullishRules', () => {
  it('isNull / isNotNull', () => {
    expect(enforce.isNull().run(null).pass).toBe(true);
    expect(runRule(enforce.isNull(), undefined).pass).toBe(false);
    expect(runRule(enforce.isNotNull(), 0).pass).toBe(true);
    expect(enforce.isNotNull().run(null).pass).toBe(false);
  });

  it('isUndefined / isNotUndefined', () => {
    expect(enforce.isUndefined().run(undefined).pass).toBe(true);
    expect(runRule(enforce.isUndefined(), null).pass).toBe(false);
    expect(enforce.isNotUndefined().run('x').pass).toBe(true);
    expect(runRule(enforce.isNotUndefined(), undefined).pass).toBe(false);
  });

  it('isNullish / isNotNullish', () => {
    expect(enforce.isNullish().run(undefined).pass).toBe(true);
    expect(enforce.isNullish().run(null).pass).toBe(true);
    expect(runRule(enforce.isNullish(), 0).pass).toBe(false);

    expect(runRule(enforce.isNotNullish(), 0).pass).toBe(true);
    expect(runRule(enforce.isNotNullish(), '').pass).toBe(true);
    expect(runRule(enforce.isNotNullish(), undefined).pass).toBe(false);
  });
});
