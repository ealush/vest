import {
  condition,
  isBlank,
  isEmpty,
  isFalsy,
  isNaN,
  isNotBlank,
  isNotEmpty,
  isNotNaN,
  isNotArray,
  isNotBoolean,
  isNotNumber,
  isNotString,
  isNotNumeric,
  isTruthy,
} from 'rules';
import { describe, expect, it } from 'vitest';

describe('generalRules', () => {
  it('truthy/falsy checks', () => {
    expect(isTruthy().run(1).passes).toBe(true);
    expect(isFalsy().run(0).passes).toBe(true);
  });

  it('empty/notEmpty checks', () => {
    expect(isEmpty().run('').passes).toBe(true);
    expect(isEmpty().run([]).passes).toBe(true);
    expect(isEmpty().run({}).passes).toBe(true);
    expect(isNotEmpty().run([1]).passes).toBe(true);
  });

  it('blank/notBlank checks', () => {
    expect(isBlank().run('   ').passes).toBe(true);
    expect(isBlank().run(null).passes).toBe(true);
    expect(isNotBlank().run('a').passes).toBe(true);
    expect(isNotBlank().run('   ').passes).toBe(false);
  });

  it('NaN checks', () => {
    // @ts-expect-error runtime only
    expect(isNaN().run(NaN as any).passes).toBe(true);
    expect(isNotNaN().run(1).passes).toBe(true);
  });

  it('condition check', () => {
    expect(condition(true).run('anything').passes).toBe(true);
    expect(condition(false).run('anything').passes).toBe(false);
  });

  it('negative type checks', () => {
    expect(isNotArray().run('str').passes).toBe(true);
    expect(isNotArray().run([]).passes).toBe(false);

    expect(isNotBoolean().run(0).passes).toBe(true);
    expect(isNotBoolean().run(true).passes).toBe(false);

    // NaN should be considered not a number for this rule
    // @ts-expect-error runtime only
    expect(isNotNumber().run(NaN as any).passes).toBe(true);
    expect(isNotNumber().run(1).passes).toBe(false);

    expect(isNotString().run(1).passes).toBe(true);
    expect(isNotString().run('x').passes).toBe(false);

    expect(isNotNumeric().run('abc').passes).toBe(true);
    expect(isNotNumeric().run('123').passes).toBe(false);
  });
});

describe('generalRules', () => {
  it('isTruthy / isFalsy', () => {
    expect(isTruthy().run(1).passes).toBe(true);
    expect(isTruthy().run('hello').passes).toBe(true);
    expect(isTruthy().run(true).passes).toBe(true);
    expect(isTruthy().run(0).passes).toBe(false);

    expect(isFalsy().run(0).passes).toBe(true);
    expect(isFalsy().run('').passes).toBe(true);
    expect(isFalsy().run(false).passes).toBe(true);
    expect(isFalsy().run('nope').passes).toBe(false);
  });

  it('isEmpty / isNotEmpty', () => {
    expect(isEmpty().run([]).passes).toBe(true);
    expect(isEmpty().run('').passes).toBe(true);
    expect(isEmpty().run({}).passes).toBe(true);
    expect(isEmpty().run(0).passes).toBe(true);
    expect(isEmpty().run(NaN).passes).toBe(true);
    expect(isEmpty().run(undefined).passes).toBe(true);
    expect(isEmpty().run(null).passes).toBe(true);
    expect(isEmpty().run(false).passes).toBe(true);

    expect(isNotEmpty().run([1]).passes).toBe(true);
    expect(isNotEmpty().run('a').passes).toBe(true);
    expect(isNotEmpty().run({ a: 1 }).passes).toBe(true);
    expect(isNotEmpty().run(1).passes).toBe(true);
  });

  it('isBlank / isNotBlank', () => {
    expect(isBlank().run(undefined).passes).toBe(true);
    expect(isBlank().run(null).passes).toBe(true);
    expect(isBlank().run('   ').passes).toBe(true);
    expect(isBlank().run('').passes).toBe(true);
    expect(isBlank().run(' a ').passes).toBe(false);

    expect(isNotBlank().run(' a ').passes).toBe(true);
    expect(isNotBlank().run('a').passes).toBe(true);
    expect(isNotBlank().run(undefined).passes).toBe(false);
  });

  it('isNaN / isNotNaN', () => {
    expect(isNaN().run(NaN).passes).toBe(true);
    expect(isNaN().run(0).passes).toBe(false);
    expect(isNotNaN().run(123).passes).toBe(true);
    expect(isNotNaN().run(NaN).passes).toBe(false);
  });

  it('condition', () => {
    expect(condition(true).run('anything').passes).toBe(true);
    expect(condition(false).run('anything').passes).toBe(false);
  });
});
