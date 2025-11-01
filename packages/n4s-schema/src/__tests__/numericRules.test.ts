import { describe, expect, it } from 'vitest';

import { enforceLazy } from 'lazy';

describe('numericRules', () => {
  it('accepts numeric strings and numbers', () => {
    expect(enforceLazy.isNumeric().isBetween(1, 5).run('3').passes).toBe(true);
    expect(enforceLazy.isNumeric().greaterThan(2).run(3).passes).toBe(true);
  });

  it('fails on non-numeric values', () => {
    expect(enforceLazy.isNumeric().run('abc').passes).toBe(false);
  });

  it('applies chained predicates after numeric coercion', () => {
    expect(enforceLazy.isNumeric().lessThan(10).isEven().run('8').passes).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().isOdd().run('8').passes).toBe(false);
    expect(enforceLazy.isNumeric().isNotBetween(1, 8).run('8').passes).toBe(
      false,
    ); // edge excluded for notBetween
    expect(enforceLazy.isNumeric().isNotBetween(9, 100).run('8').passes).toBe(
      true,
    );
  });

  it('numberEquals / numberNotEquals work across numbers and strings', () => {
    expect(enforceLazy.isNumeric().numberEquals(8).run('8').passes).toBe(true);
    expect(enforceLazy.isNumeric().numberEquals('8').run(8).passes).toBe(true);
    expect(enforceLazy.isNumeric().numberNotEquals(9).run('8').passes).toBe(
      true,
    );
    expect(enforceLazy.isNumeric().numberNotEquals('8').run(8).passes).toBe(
      false,
    );
  });
});
