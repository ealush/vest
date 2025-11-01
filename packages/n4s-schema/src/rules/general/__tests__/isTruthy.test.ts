import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isTruthy', () => {
  it('passes for truthy numbers', () => {
    expect(enforceLazy.isTruthy().run(1).passes).toBe(true);
    expect(enforceLazy.isTruthy().run(-1).passes).toBe(true);
    expect(enforceLazy.isTruthy().run(Infinity).passes).toBe(true);
  });

  it('passes for truthy strings', () => {
    expect(enforceLazy.isTruthy().run('a').passes).toBe(true);
    expect(enforceLazy.isTruthy().run('0').passes).toBe(true);
    expect(enforceLazy.isTruthy().run('false').passes).toBe(true);
  });

  it('passes for objects and arrays', () => {
    expect(enforceLazy.isTruthy().run({}).passes).toBe(true);
    expect(enforceLazy.isTruthy().run([]).passes).toBe(true);
    expect(enforceLazy.isTruthy().run(() => {}).passes).toBe(true);
  });

  it('passes for true', () => {
    expect(enforceLazy.isTruthy().run(true).passes).toBe(true);
  });

  it('fails for zero', () => {
    expect(enforceLazy.isTruthy().run(0).passes).toBe(false);
  });

  it('fails for empty string', () => {
    expect(enforceLazy.isTruthy().run('').passes).toBe(false);
  });

  it('fails for false', () => {
    expect(enforceLazy.isTruthy().run(false).passes).toBe(false);
  });

  it('fails for null', () => {
    const value: any = null;
    expect(enforceLazy.isTruthy().run(value).passes).toBe(false);
  });

  it('fails for undefined', () => {
    const value: any = undefined;
    expect(enforceLazy.isTruthy().run(value).passes).toBe(false);
  });

  it('fails for NaN', () => {
    expect(enforceLazy.isTruthy().run(NaN).passes).toBe(false);
  });
});
