import { describe, expect, it } from 'vitest';

import { enforceLazy } from 'lazy';

describe('generalRules', () => {
  it('truthy/falsy checks', () => {
    expect(enforceLazy.isTruthy().run(1).pass).toBe(true);
    expect(enforceLazy.isFalsy().run(0).pass).toBe(true);
  });

  it('empty/notEmpty checks', () => {
    expect(enforceLazy.isEmpty().run('').pass).toBe(true);
    expect(enforceLazy.isEmpty().run([]).pass).toBe(true);
    expect(enforceLazy.isEmpty().run({}).pass).toBe(true);
    expect(enforceLazy.isNotEmpty().run([1]).pass).toBe(true);
  });

  // isBlank / isNotBlank were moved to string rules

  it('NaN checks', () => {
    expect(enforceLazy.isNotNaN().run(1).pass).toBe(true);
  });

  it('condition check', () => {
    expect(enforceLazy.condition(() => true).run('anything').pass).toBe(true);
    expect(enforceLazy.condition(() => false).run('anything').pass).toBe(false);
  });

  it('negative type checks', () => {
    expect(enforceLazy.isNotArray().run('str').pass).toBe(true);
    expect(enforceLazy.isNotArray().run([]).pass).toBe(false);

    expect(enforceLazy.isNotBoolean().run(0).pass).toBe(true);
    expect(enforceLazy.isNotBoolean().run(true).pass).toBe(false);

    // NaN should be considered not a number for this rule
    expect(enforceLazy.isNotNumber().run(NaN).pass).toBe(true);
    expect(enforceLazy.isNotNumber().run(1).pass).toBe(false);

    expect(enforceLazy.isNotString().run(1).pass).toBe(true);
    expect(enforceLazy.isNotString().run('x').pass).toBe(false);

    expect(enforceLazy.isNotNumeric().run('abc').pass).toBe(true);
    expect(enforceLazy.isNotNumeric().run('123').pass).toBe(false);
  });
});

describe('generalRules - extended', () => {
  it('isTruthy / isFalsy', () => {
    expect(enforceLazy.isTruthy().run(1).pass).toBe(true);
    expect(enforceLazy.isTruthy().run('hello').pass).toBe(true);
    expect(enforceLazy.isTruthy().run(true).pass).toBe(true);
    expect(enforceLazy.isTruthy().run(0).pass).toBe(false);

    expect(enforceLazy.isFalsy().run(0).pass).toBe(true);
    expect(enforceLazy.isFalsy().run('').pass).toBe(true);
    expect(enforceLazy.isFalsy().run(false).pass).toBe(true);
    expect(enforceLazy.isFalsy().run('nope').pass).toBe(false);
  });

  it('isEmpty / isNotEmpty', () => {
    expect(enforceLazy.isEmpty().run([]).pass).toBe(true);
    expect(enforceLazy.isEmpty().run('').pass).toBe(true);
    expect(enforceLazy.isEmpty().run({}).pass).toBe(true);
    expect(enforceLazy.isEmpty().run(0).pass).toBe(true);
    expect(enforceLazy.isEmpty().run(NaN).pass).toBe(true);
    expect(enforceLazy.isEmpty().run(undefined).pass).toBe(true);
    expect(enforceLazy.isEmpty().run(null).pass).toBe(true);
    expect(enforceLazy.isEmpty().run(false).pass).toBe(true);

    expect(enforceLazy.isNotEmpty().run([1]).pass).toBe(true);
    expect(enforceLazy.isNotEmpty().run('a').pass).toBe(true);
    expect(enforceLazy.isNotEmpty().run({ a: 1 }).pass).toBe(true);
    expect(enforceLazy.isNotEmpty().run(1).pass).toBe(true);
  });

  // isBlank / isNotBlank moved to stringRules and now apply only to strings

  it('isNaN / isNotNaN', () => {
    expect(enforceLazy.isNotNaN().run(123).pass).toBe(true);
    expect(enforceLazy.isNotNaN().run(NaN).pass).toBe(false);
  });

  it('condition', () => {
    expect(enforceLazy.condition(() => true).run('anything').pass).toBe(true);
    expect(enforceLazy.condition(() => false).run('anything').pass).toBe(false);
  });
});
