import { describe, it, expect } from 'vitest';

import { isTruthy } from '../general/isTruthy';

describe('isTruthy', () => {
  it('passes for truthy numbers', () => {
    expect(isTruthy().run(1).passes).toBe(true);
    expect(isTruthy().run(-1).passes).toBe(true);
    expect(isTruthy().run(Infinity).passes).toBe(true);
  });

  it('passes for truthy strings', () => {
    expect(isTruthy().run('a').passes).toBe(true);
    expect(isTruthy().run('0').passes).toBe(true);
    expect(isTruthy().run('false').passes).toBe(true);
  });

  it('passes for objects and arrays', () => {
    expect(isTruthy().run({}).passes).toBe(true);
    expect(isTruthy().run([]).passes).toBe(true);
    expect(isTruthy().run(() => {}).passes).toBe(true);
  });

  it('passes for true', () => {
    expect(isTruthy().run(true).passes).toBe(true);
  });

  it('fails for zero', () => {
    expect(isTruthy().run(0).passes).toBe(false);
  });

  it('fails for empty string', () => {
    expect(isTruthy().run('').passes).toBe(false);
  });

  it('fails for false', () => {
    expect(isTruthy().run(false).passes).toBe(false);
  });

  it('fails for null', () => {
    const value: any = null;
    expect(isTruthy().run(value).passes).toBe(false);
  });

  it('fails for undefined', () => {
    const value: any = undefined;
    expect(isTruthy().run(value).passes).toBe(false);
  });

  it('fails for NaN', () => {
    expect(isTruthy().run(NaN).passes).toBe(false);
  });
});
