import { describe, expect, it } from 'vitest';

import { enforceLazy } from 'lazy';

describe('numberRules', () => {
  it('passes when all number predicates pass', () => {
    expect(
      enforceLazy.isNumber().greaterThan(3).lessThanOrEquals(5).run(4).passes,
    ).toBe(true);
    expect(enforceLazy.isNumber().isBetween(1, 10).isEven().run(4).passes).toBe(
      true,
    );
    expect(enforceLazy.isNumber().isNotBetween(100, 200).run(4).passes).toBe(
      true,
    );
    expect(enforceLazy.isNumber().isPositive().run(1).passes).toBe(true);
  });

  it('fails when any number predicate fails', () => {
    expect(enforceLazy.isNumber().greaterThan(3).run(3).passes).toBe(false);
    expect(enforceLazy.isNumber().isBetween(1, 2).run(3).passes).toBe(false);
    expect(enforceLazy.isNumber().isNotBetween(0, 4).run(4).passes).toBe(false);
    expect(enforceLazy.isNumber().isOdd().run(4).passes).toBe(false);
  });

  it('rejects non-number inputs at the root', () => {
    // @ts-expect-error testing runtime behavior
    expect(enforceLazy.isNumber().run('4' as any).passes).toBe(false);
  });

  it('numberEquals / numberNotEquals', () => {
    expect(enforceLazy.isNumber().numberEquals(4).run(4).passes).toBe(true);
    // @ts-expect-error runtime path: string is not a number entry
    expect(
      enforceLazy
        .isNumber()
        .numberEquals('4' as any)
        .run(4 as any).passes,
    ).toBe(true);
    expect(enforceLazy.isNumber().numberNotEquals(5).run(4).passes).toBe(true);
    expect(enforceLazy.isNumber().numberNotEquals(4).run(4).passes).toBe(false);
  });

  it('isNegative', () => {
    expect(enforceLazy.isNumber().isNegative().run(-1).passes).toBe(true);
    expect(enforceLazy.isNumber().isPositive().run(-1).passes).toBe(false);
  });
});
