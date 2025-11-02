import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isFalsy', () => {
  it('pass for zero', () => {
    expect(enforceLazy.isFalsy().run(0).pass).toBe(true);
    expect(enforceLazy.isFalsy().run(-0).pass).toBe(true);
  });

  it('pass for empty string', () => {
    expect(enforceLazy.isFalsy().run('').pass).toBe(true);
  });

  it('pass for false', () => {
    expect(enforceLazy.isFalsy().run(false).pass).toBe(true);
  });

  it('pass for null', () => {
    const value: any = null;
    expect(enforceLazy.isFalsy().run(value).pass).toBe(true);
  });

  it('pass for undefined', () => {
    const value: any = undefined;
    expect(enforceLazy.isFalsy().run(value).pass).toBe(true);
  });

  it('pass for NaN', () => {
    expect(enforceLazy.isFalsy().run(NaN).pass).toBe(true);
  });

  it('fails for truthy numbers', () => {
    expect(enforceLazy.isFalsy().run(1).pass).toBe(false);
    expect(enforceLazy.isFalsy().run(-1).pass).toBe(false);
  });

  it('fails for truthy strings', () => {
    expect(enforceLazy.isFalsy().run('a').pass).toBe(false);
    expect(enforceLazy.isFalsy().run('0').pass).toBe(false);
  });

  it('fails for objects and arrays', () => {
    expect(enforceLazy.isFalsy().run({}).pass).toBe(false);
    expect(enforceLazy.isFalsy().run([]).pass).toBe(false);
  });

  it('fails for true', () => {
    expect(enforceLazy.isFalsy().run(true).pass).toBe(false);
  });
});
