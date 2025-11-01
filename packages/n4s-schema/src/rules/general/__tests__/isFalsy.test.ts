import { describe, it, expect } from 'vitest';

import { isFalsy } from '../isFalsy';

describe('isFalsy', () => {
  it('passes for zero', () => {
    expect(isFalsy().run(0).passes).toBe(true);
    expect(isFalsy().run(-0).passes).toBe(true);
  });

  it('passes for empty string', () => {
    expect(isFalsy().run('').passes).toBe(true);
  });

  it('passes for false', () => {
    expect(isFalsy().run(false).passes).toBe(true);
  });

  it('passes for null', () => {
    const value: any = null;
    expect(isFalsy().run(value).passes).toBe(true);
  });

  it('passes for undefined', () => {
    const value: any = undefined;
    expect(isFalsy().run(value).passes).toBe(true);
  });

  it('passes for NaN', () => {
    expect(isFalsy().run(NaN).passes).toBe(true);
  });

  it('fails for truthy numbers', () => {
    expect(isFalsy().run(1).passes).toBe(false);
    expect(isFalsy().run(-1).passes).toBe(false);
  });

  it('fails for truthy strings', () => {
    expect(isFalsy().run('a').passes).toBe(false);
    expect(isFalsy().run('0').passes).toBe(false);
  });

  it('fails for objects and arrays', () => {
    expect(isFalsy().run({}).passes).toBe(false);
    expect(isFalsy().run([]).passes).toBe(false);
  });

  it('fails for true', () => {
    expect(isFalsy().run(true).passes).toBe(false);
  });
});
