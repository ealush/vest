import { describe, expect, it } from 'vitest';

import { isNumber } from 'numberRules';

describe('numberRules', () => {
  it('passes when all number predicates pass', () => {
    expect(isNumber().greaterThan(3).lessThanOrEquals(5).run(4).passes).toBe(
      true,
    );
    expect(isNumber().between(1, 10).isEven().run(4).passes).toBe(true);
    expect(isNumber().notBetween(100, 200).run(4).passes).toBe(true);
    expect(isNumber().isPositive().run(1).passes).toBe(true);
  });

  it('fails when any number predicate fails', () => {
    expect(isNumber().greaterThan(3).run(3).passes).toBe(false);
    expect(isNumber().between(1, 2).run(3).passes).toBe(false);
    expect(isNumber().notBetween(0, 4).run(4).passes).toBe(false);
    expect(isNumber().isOdd().run(4).passes).toBe(false);
  });

  it('rejects non-number inputs at the root', () => {
    // @ts-expect-error testing runtime behavior
    expect(isNumber().run('4' as any).passes).toBe(false);
  });

  it('numberEquals / numberNotEquals', () => {
    expect(isNumber().numberEquals(4).run(4).passes).toBe(true);
    // @ts-expect-error runtime path: string is not a number entry
    expect(
      isNumber()
        .numberEquals('4' as any)
        .run(4 as any).passes,
    ).toBe(true);
    expect(isNumber().numberNotEquals(5).run(4).passes).toBe(true);
    expect(isNumber().numberNotEquals(4).run(4).passes).toBe(false);
  });

  it('isNaN / isNotNaN / isNegative', () => {
    // @ts-expect-error runtime path only
    expect(
      isNumber()
        .isNaN()
        .run(NaN as any).passes,
    ).toBe(true);
    expect(isNumber().isNotNaN().run(1).passes).toBe(true);
    expect(isNumber().isNegative().run(-1).passes).toBe(true);
    expect(isNumber().isPositive().run(-1).passes).toBe(false);
  });
});
