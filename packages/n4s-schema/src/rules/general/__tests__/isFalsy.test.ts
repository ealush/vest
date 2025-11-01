import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isFalsy', () => {
  it('passes for zero', () => {
    expect(enforceLazy.isFalsy().run(0).passes).toBe(true);
    expect(enforceLazy.isFalsy().run(-0).passes).toBe(true);
  });

  it('passes for empty string', () => {
    expect(enforceLazy.isFalsy().run('').passes).toBe(true);
  });

  it('passes for false', () => {
    expect(enforceLazy.isFalsy().run(false).passes).toBe(true);
  });

  it('passes for null', () => {
    const value: any = null;
    expect(enforceLazy.isFalsy().run(value).passes).toBe(true);
  });

  it('passes for undefined', () => {
    const value: any = undefined;
    expect(enforceLazy.isFalsy().run(value).passes).toBe(true);
  });

  it('passes for NaN', () => {
    expect(enforceLazy.isFalsy().run(NaN).passes).toBe(true);
  });

  it('fails for truthy numbers', () => {
    expect(enforceLazy.isFalsy().run(1).passes).toBe(false);
    expect(enforceLazy.isFalsy().run(-1).passes).toBe(false);
  });

  it('fails for truthy strings', () => {
    expect(enforceLazy.isFalsy().run('a').passes).toBe(false);
    expect(enforceLazy.isFalsy().run('0').passes).toBe(false);
  });

  it('fails for objects and arrays', () => {
    expect(enforceLazy.isFalsy().run({}).passes).toBe(false);
    expect(enforceLazy.isFalsy().run([]).passes).toBe(false);
  });

  it('fails for true', () => {
    expect(enforceLazy.isFalsy().run(true).passes).toBe(false);
  });
});
