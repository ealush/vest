import { describe, expect, it } from 'vitest';

import { enforce } from 'n4s-schema';

describe('generalRules', () => {
  it('truthy/falsy checks', () => {
    expect(enforce.isTruthy().run(1).pass).toBe(true);
    expect(enforce.isFalsy().run(0).pass).toBe(true);
  });

  it('empty/notEmpty checks', () => {
    expect(enforce.isEmpty().run('').pass).toBe(true);
    expect(enforce.isEmpty().run([]).pass).toBe(true);
    expect(enforce.isEmpty().run({}).pass).toBe(true);
    expect(enforce.isNotEmpty().run([1]).pass).toBe(true);
  });

  // isBlank / isNotBlank were moved to string rules

  it('NaN checks', () => {
    expect(enforce.isNotNaN().run(1).pass).toBe(true);
  });

  it('condition check', () => {
    expect(enforce.condition(() => true).run('anything').pass).toBe(true);
    expect(enforce.condition(() => false).run('anything').pass).toBe(false);
  });

  it('negative type checks', () => {
    expect(enforce.isNotArray().run('str').pass).toBe(true);
    expect(enforce.isNotArray().run([]).pass).toBe(false);

    expect(enforce.isNotBoolean().run(0).pass).toBe(true);
    expect(enforce.isNotBoolean().run(true).pass).toBe(false);

    // NaN should be considered not a number for this rule
    expect(enforce.isNotNumber().run(NaN).pass).toBe(true);
    expect(enforce.isNotNumber().run(1).pass).toBe(false);

    expect(enforce.isNotString().run(1).pass).toBe(true);
    expect(enforce.isNotString().run('x').pass).toBe(false);

    expect(enforce.isNotNumeric().run('abc').pass).toBe(true);
    expect(enforce.isNotNumeric().run('123').pass).toBe(false);
  });
});

describe('generalRules - extended', () => {
  it('isTruthy / isFalsy', () => {
    expect(enforce.isTruthy().run(1).pass).toBe(true);
    expect(enforce.isTruthy().run('hello').pass).toBe(true);
    expect(enforce.isTruthy().run(true).pass).toBe(true);
    expect(enforce.isTruthy().run(0).pass).toBe(false);

    expect(enforce.isFalsy().run(0).pass).toBe(true);
    expect(enforce.isFalsy().run('').pass).toBe(true);
    expect(enforce.isFalsy().run(false).pass).toBe(true);
    expect(enforce.isFalsy().run('nope').pass).toBe(false);
  });

  it('isEmpty / isNotEmpty', () => {
    expect(enforce.isEmpty().run([]).pass).toBe(true);
    expect(enforce.isEmpty().run('').pass).toBe(true);
    expect(enforce.isEmpty().run({}).pass).toBe(true);
    expect(enforce.isEmpty().run(0).pass).toBe(true);
    expect(enforce.isEmpty().run(NaN).pass).toBe(true);
    expect(enforce.isEmpty().run(undefined).pass).toBe(true);
    expect(enforce.isEmpty().run(null).pass).toBe(true);
    expect(enforce.isEmpty().run(false).pass).toBe(true);

    expect(enforce.isNotEmpty().run([1]).pass).toBe(true);
    expect(enforce.isNotEmpty().run('a').pass).toBe(true);
    expect(enforce.isNotEmpty().run({ a: 1 }).pass).toBe(true);
    expect(enforce.isNotEmpty().run(1).pass).toBe(true);
  });

  // isBlank / isNotBlank moved to stringRules and now apply only to strings

  it('isNaN / isNotNaN', () => {
    expect(enforce.isNotNaN().run(123).pass).toBe(true);
    expect(enforce.isNotNaN().run(NaN).pass).toBe(false);
  });

  it('condition', () => {
    expect(enforce.condition(() => true).run('anything').pass).toBe(true);
    expect(enforce.condition(() => false).run('anything').pass).toBe(false);
  });
});
