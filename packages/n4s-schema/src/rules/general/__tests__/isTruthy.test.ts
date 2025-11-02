import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isTruthy', () => {
  it('pass for truthy numbers', () => {
    expect(enforceLazy.isTruthy().run(1).pass).toBe(true);
    expect(enforceLazy.isTruthy().run(-1).pass).toBe(true);
    expect(enforceLazy.isTruthy().run(Infinity).pass).toBe(true);
  });

  it('pass for truthy strings', () => {
    expect(enforceLazy.isTruthy().run('a').pass).toBe(true);
    expect(enforceLazy.isTruthy().run('0').pass).toBe(true);
    expect(enforceLazy.isTruthy().run('false').pass).toBe(true);
  });

  it('pass for objects and arrays', () => {
    expect(enforceLazy.isTruthy().run({}).pass).toBe(true);
    expect(enforceLazy.isTruthy().run([]).pass).toBe(true);
    expect(enforceLazy.isTruthy().run(() => {}).pass).toBe(true);
  });

  it('pass for true', () => {
    expect(enforceLazy.isTruthy().run(true).pass).toBe(true);
  });

  it('fails for zero', () => {
    expect(enforceLazy.isTruthy().run(0).pass).toBe(false);
  });

  it('fails for empty string', () => {
    expect(enforceLazy.isTruthy().run('').pass).toBe(false);
  });

  it('fails for false', () => {
    expect(enforceLazy.isTruthy().run(false).pass).toBe(false);
  });

  it('fails for null', () => {
    const value: any = null;
    expect(enforceLazy.isTruthy().run(value).pass).toBe(false);
  });

  it('fails for undefined', () => {
    const value: any = undefined;
    expect(enforceLazy.isTruthy().run(value).pass).toBe(false);
  });

  it('fails for NaN', () => {
    expect(enforceLazy.isTruthy().run(NaN).pass).toBe(false);
  });
});
