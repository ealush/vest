import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isFalsy', () => {
  it('pass for zero', () => {
    expect(enforce.isFalsy().run(0).pass).toBe(true);
    expect(enforce.isFalsy().run(-0).pass).toBe(true);
  });

  it('pass for empty string', () => {
    expect(enforce.isFalsy().run('').pass).toBe(true);
  });

  it('pass for false', () => {
    expect(enforce.isFalsy().run(false).pass).toBe(true);
  });

  it('pass for null', () => {
    const value: any = null;
    expect(enforce.isFalsy().run(value).pass).toBe(true);
  });

  it('pass for undefined', () => {
    const value: any = undefined;
    expect(enforce.isFalsy().run(value).pass).toBe(true);
  });

  it('pass for NaN', () => {
    expect(enforce.isFalsy().run(NaN).pass).toBe(true);
  });

  it('fails for truthy numbers', () => {
    expect(enforce.isFalsy().run(1).pass).toBe(false);
    expect(enforce.isFalsy().run(-1).pass).toBe(false);
  });

  it('fails for truthy strings', () => {
    expect(enforce.isFalsy().run('a').pass).toBe(false);
    expect(enforce.isFalsy().run('0').pass).toBe(false);
  });

  it('fails for objects and arrays', () => {
    expect(enforce.isFalsy().run({}).pass).toBe(false);
    expect(enforce.isFalsy().run([]).pass).toBe(false);
  });

  it('fails for true', () => {
    expect(enforce.isFalsy().run(true).pass).toBe(false);
  });
});
