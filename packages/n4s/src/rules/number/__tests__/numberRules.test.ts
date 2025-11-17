import { describe, expect, it } from 'vitest';

import { enforce } from '../../../n4s';

describe('numberRules', () => {
  it('pass when all number predicates pass', () => {
    expect(
      enforce.isNumber().greaterThan(3).lessThanOrEquals(5).run(4).pass,
    ).toBe(true);
    expect(enforce.isNumber().isBetween(1, 10).isEven().run(4).pass).toBe(true);
    expect(enforce.isNumber().isNotBetween(100, 200).run(4).pass).toBe(true);
    expect(enforce.isNumber().isPositive().run(1).pass).toBe(true);
  });

  it('fails when any number predicate fails', () => {
    expect(enforce.isNumber().greaterThan(3).run(3).pass).toBe(false);
    expect(enforce.isNumber().isBetween(1, 2).run(3).pass).toBe(false);
    expect(enforce.isNumber().isNotBetween(0, 4).run(4).pass).toBe(false);
    expect(enforce.isNumber().isOdd().run(4).pass).toBe(false);
  });

  it('rejects non-number inputs at the root', () => {
    // Type test: testing runtime behavior
    expect(enforce.isNumber().run('4' as any).pass).toBe(false);
  });

  it('numberEquals / numberNotEquals', () => {
    expect(enforce.isNumber().numberEquals(4).run(4).pass).toBe(true);
    // Type test: runtime path: string is not a number entry
    expect(
      enforce
        .isNumber()
        .numberEquals('4' as any)
        .run(4 as any).pass,
    ).toBe(true);
    expect(enforce.isNumber().numberNotEquals(5).run(4).pass).toBe(true);
    expect(enforce.isNumber().numberNotEquals(4).run(4).pass).toBe(false);
  });

  it('isNegative', () => {
    expect(enforce.isNumber().isNegative().run(-1).pass).toBe(true);
    expect(enforce.isNumber().isPositive().run(-1).pass).toBe(false);
  });
});
