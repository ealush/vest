import { describe, expect, it } from 'vitest';

import { isNumeric } from 'numericRules';

describe('numericRules', () => {
  it('accepts numeric strings and numbers', () => {
    expect(isNumeric().between(1, 5).run('3').passes).toBe(true);
    expect(isNumeric().greaterThan(2).run(3).passes).toBe(true);
  });

  it('fails on non-numeric values', () => {
    expect(isNumeric().run('abc').passes).toBe(false);
  });

  it('applies chained predicates after numeric coercion', () => {
    expect(isNumeric().lessThan(10).isEven().run('8').passes).toBe(true);
    expect(isNumeric().isOdd().run('8').passes).toBe(false);
    expect(isNumeric().notBetween(1, 8).run('8').passes).toBe(false); // edge excluded for notBetween
    expect(isNumeric().notBetween(9, 100).run('8').passes).toBe(true);
  });

  it('numberEquals / numberNotEquals work across numbers and strings', () => {
    expect(isNumeric().numberEquals(8).run('8').passes).toBe(true);
    expect(isNumeric().numberEquals('8').run(8).passes).toBe(true);
    expect(isNumeric().numberNotEquals(9).run('8').passes).toBe(true);
    expect(isNumeric().numberNotEquals('8').run(8).passes).toBe(false);
  });
});
