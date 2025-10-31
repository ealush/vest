import { enforceLazy } from 'lazy';
import { describe, expect, it } from 'vitest';

describe('generalRules', () => {
  it('truthy/falsy checks', () => {
    expect(enforceLazy.isTruthy().run(1).passes).toBe(true);
    expect(enforceLazy.isFalsy().run(0).passes).toBe(true);
  });

  it('empty/notEmpty checks', () => {
    expect(enforceLazy.isEmpty().run('').passes).toBe(true);
    expect(enforceLazy.isEmpty().run([]).passes).toBe(true);
    expect(enforceLazy.isEmpty().run({}).passes).toBe(true);
    expect(enforceLazy.isNotEmpty().run([1]).passes).toBe(true);
  });

  // isBlank / isNotBlank were moved to string rules

  it('NaN checks', () => {
    expect(enforceLazy.isNaN().run(NaN).passes).toBe(true);
    expect(enforceLazy.isNotNaN().run(1).passes).toBe(true);
  });

  it('condition check', () => {
    expect(enforceLazy.condition(true).run('anything').passes).toBe(true);
    expect(enforceLazy.condition(false).run('anything').passes).toBe(false);
  });

  it('negative type checks', () => {
    expect(enforceLazy.isNotArray().run('str').passes).toBe(true);
    expect(enforceLazy.isNotArray().run([]).passes).toBe(false);

    expect(enforceLazy.isNotBoolean().run(0).passes).toBe(true);
    expect(enforceLazy.isNotBoolean().run(true).passes).toBe(false);

    // NaN should be considered not a number for this rule
    expect(enforceLazy.isNotNumber().run(NaN).passes).toBe(true);
    expect(enforceLazy.isNotNumber().run(1).passes).toBe(false);

    expect(enforceLazy.isNotString().run(1).passes).toBe(true);
    expect(enforceLazy.isNotString().run('x').passes).toBe(false);

    expect(enforceLazy.isNotNumeric().run('abc').passes).toBe(true);
    expect(enforceLazy.isNotNumeric().run('123').passes).toBe(false);
  });
});

describe('generalRules - extended', () => {
  it('isTruthy / isFalsy', () => {
    expect(enforceLazy.isTruthy().run(1).passes).toBe(true);
    expect(enforceLazy.isTruthy().run('hello').passes).toBe(true);
    expect(enforceLazy.isTruthy().run(true).passes).toBe(true);
    expect(enforceLazy.isTruthy().run(0).passes).toBe(false);

    expect(enforceLazy.isFalsy().run(0).passes).toBe(true);
    expect(enforceLazy.isFalsy().run('').passes).toBe(true);
    expect(enforceLazy.isFalsy().run(false).passes).toBe(true);
    expect(enforceLazy.isFalsy().run('nope').passes).toBe(false);
  });

  it('isEmpty / isNotEmpty', () => {
    expect(enforceLazy.isEmpty().run([]).passes).toBe(true);
    expect(enforceLazy.isEmpty().run('').passes).toBe(true);
    expect(enforceLazy.isEmpty().run({}).passes).toBe(true);
    expect(enforceLazy.isEmpty().run(0).passes).toBe(true);
    expect(enforceLazy.isEmpty().run(NaN).passes).toBe(true);
    expect(enforceLazy.isEmpty().run(undefined).passes).toBe(true);
    expect(enforceLazy.isEmpty().run(null).passes).toBe(true);
    expect(enforceLazy.isEmpty().run(false).passes).toBe(true);

    expect(enforceLazy.isNotEmpty().run([1]).passes).toBe(true);
    expect(enforceLazy.isNotEmpty().run('a').passes).toBe(true);
    expect(enforceLazy.isNotEmpty().run({ a: 1 }).passes).toBe(true);
    expect(enforceLazy.isNotEmpty().run(1).passes).toBe(true);
  });

  // isBlank / isNotBlank moved to stringRules and now apply only to strings

  it('isNaN / isNotNaN', () => {
    expect(enforceLazy.isNaN().run(NaN).passes).toBe(true);
    expect(enforceLazy.isNaN().run(0).passes).toBe(false);
    expect(enforceLazy.isNotNaN().run(123).passes).toBe(true);
    expect(enforceLazy.isNotNaN().run(NaN).passes).toBe(false);
  });

  it('condition', () => {
    expect(enforceLazy.condition(true).run('anything').passes).toBe(true);
    expect(enforceLazy.condition(false).run('anything').passes).toBe(false);
  });
});
