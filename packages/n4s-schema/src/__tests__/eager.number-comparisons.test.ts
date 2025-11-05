import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('eager: number comparisons and ranges', () => {
  it('number comparisons with coercion - greaterThan / greaterThanOrEquals', () => {
    // greaterThan
    enforce(1).greaterThan(0);
    enforce('10').greaterThan(0);
    enforce(900).greaterThan('100');

    expect(() => enforce(100).greaterThan(100)).toThrow();
    expect(() => enforce('100').greaterThan(110)).toThrow();
    expect(() => enforce([100] as any).greaterThan(1)).toThrow();

    // lessThan paired for symmetry in this suite
    enforce(0).lessThan(1);
    enforce(2).lessThan('10');
    enforce('90').lessThan(100);

    expect(() => enforce(100).lessThan(100)).toThrow();
    expect(() => enforce('110').lessThan(100)).toThrow();
    expect(() => enforce([0] as any).lessThan(1)).toThrow();

    // greaterThanOrEquals
    enforce(900).greaterThanOrEquals('100');
    enforce(100).greaterThanOrEquals('100');
    enforce('1337').greaterThanOrEquals(1337);

    expect(() => enforce(100).greaterThanOrEquals('120')).toThrow();
    expect(() => enforce('100').greaterThanOrEquals(110)).toThrow();
    expect(() => enforce([100] as any).greaterThanOrEquals(1)).toThrow();

    // lessThanOrEquals
    enforce(0).lessThanOrEquals(1);
    enforce(2).lessThanOrEquals('10');
    enforce('90').lessThanOrEquals(100);
    enforce(100).lessThanOrEquals('100');

    expect(() => enforce(100).lessThanOrEquals(90)).toThrow();
    expect(() => enforce('110').lessThanOrEquals(100)).toThrow();
    expect(() => enforce([0] as any).lessThanOrEquals(1)).toThrow();
  });

  it('numberEquals / numberNotEquals', () => {
    // numberEquals - coerces strings to numbers
    enforce(0).numberEquals(0);
    enforce(2).numberEquals('2');
    enforce('100').numberEquals(100);

    expect(() => enforce(100).numberEquals(10)).toThrow();
    expect(() => enforce('110').numberEquals(100)).toThrow();
    expect(() => enforce([0] as any).numberEquals(1)).toThrow();

    // numberNotEquals
    enforce(2).numberNotEquals(0);
    enforce('11').numberNotEquals('10');
    enforce(100).numberNotEquals(99);

    expect(() => enforce(100).numberNotEquals(100)).toThrow();
    expect(() => enforce('110').numberNotEquals(110)).toThrow();
  });

  it('isBetween / isNotBetween', () => {
    // isBetween: inclusive on both ends
    enforce(5).isBetween(1, 10);
    enforce('5').isBetween(1, 10);
    enforce(1).isBetween(1, 10);
    enforce(10).isBetween(1, 10);

    expect(() => enforce(0).isBetween(1, 10)).toThrow();
    expect(() => enforce(11).isBetween(1, 10)).toThrow();

    // isNotBetween
    enforce(0).isNotBetween(1, 10);
    enforce(11).isNotBetween(1, 10);

    expect(() => enforce(5).isNotBetween(1, 10)).toThrow();
    expect(() => enforce(1).isNotBetween(1, 10)).toThrow();
  });

  it('parity - isEven / isOdd', () => {
    // isEven
    enforce(2).isEven();
    enforce(0).isEven();
    enforce(-4).isEven();

    expect(() => enforce(3).isEven()).toThrow();
    expect(() => enforce(1).isEven()).toThrow();

    // isOdd
    enforce(3).isOdd();
    enforce(1).isOdd();
    enforce(-3).isOdd();

    expect(() => enforce(2).isOdd()).toThrow();
    expect(() => enforce(0).isOdd()).toThrow();
  });

  it('sign - isPositive / isNegative', () => {
    // isPositive
    enforce(1).isPositive();
    enforce(100).isPositive();

    expect(() => enforce(0).isPositive()).toThrow();
    expect(() => enforce(-1).isPositive()).toThrow();

    // isNegative
    enforce(-1).isNegative();
    enforce(-100).isNegative();

    expect(() => enforce(0).isNegative()).toThrow();
    expect(() => enforce(1).isNegative()).toThrow();
  });
});
