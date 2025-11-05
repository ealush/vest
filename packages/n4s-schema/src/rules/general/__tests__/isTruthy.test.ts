import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isTruthy', () => {
  it('pass for truthy numbers', () => {
    expect(enforce.isTruthy().run(1).pass).toBe(true);
    expect(enforce.isTruthy().run(-1).pass).toBe(true);
    expect(enforce.isTruthy().run(Infinity).pass).toBe(true);
  });

  it('pass for truthy strings', () => {
    expect(enforce.isTruthy().run('a').pass).toBe(true);
    expect(enforce.isTruthy().run('0').pass).toBe(true);
    expect(enforce.isTruthy().run('false').pass).toBe(true);
  });

  it('pass for objects and arrays', () => {
    expect(enforce.isTruthy().run({}).pass).toBe(true);
    expect(enforce.isTruthy().run([]).pass).toBe(true);
    expect(enforce.isTruthy().run(() => {}).pass).toBe(true);
  });

  it('pass for true', () => {
    expect(enforce.isTruthy().run(true).pass).toBe(true);
  });

  it('fails for zero', () => {
    expect(enforce.isTruthy().run(0).pass).toBe(false);
  });

  it('fails for empty string', () => {
    expect(enforce.isTruthy().run('').pass).toBe(false);
  });

  it('fails for false', () => {
    expect(enforce.isTruthy().run(false).pass).toBe(false);
  });

  it('fails for null', () => {
    const value: any = null;
    expect(enforce.isTruthy().run(value).pass).toBe(false);
  });

  it('fails for undefined', () => {
    const value: any = undefined;
    expect(enforce.isTruthy().run(value).pass).toBe(false);
  });

  it('fails for NaN', () => {
    expect(enforce.isTruthy().run(NaN).pass).toBe(false);
  });
});
