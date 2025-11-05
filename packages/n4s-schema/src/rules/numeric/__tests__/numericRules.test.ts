import { describe, expect, it } from 'vitest';

import { enforce } from 'n4s-schema';

describe('numericRules', () => {
  it('accepts numeric strings and numbers', () => {
    expect(enforce.isNumeric().isBetween(1, 5).run('3').pass).toBe(true);
    expect(enforce.isNumeric().greaterThan(2).run(3).pass).toBe(true);
  });

  it('fails on non-numeric values', () => {
    expect(enforce.isNumeric().run('abc').pass).toBe(false);
  });

  it('applies chained predicates after numeric coercion', () => {
    expect(enforce.isNumeric().lessThan(10).isEven().run('8').pass).toBe(true);
    expect(enforce.isNumeric().isOdd().run('8').pass).toBe(false);
    expect(enforce.isNumeric().isNotBetween(1, 8).run('8').pass).toBe(false); // edge excluded for notBetween
    expect(enforce.isNumeric().isNotBetween(9, 100).run('8').pass).toBe(true);
  });

  it('numberEquals / numberNotEquals work across numbers and strings', () => {
    expect(enforce.isNumeric().numberEquals(8).run('8').pass).toBe(true);
    expect(enforce.isNumeric().numberEquals('8').run(8).pass).toBe(true);
    expect(enforce.isNumeric().numberNotEquals(9).run('8').pass).toBe(true);
    expect(enforce.isNumeric().numberNotEquals('8').run(8).pass).toBe(false);
  });
});
