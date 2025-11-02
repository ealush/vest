import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isBoolean', () => {
  it('pass for true', () => {
    expect(enforceLazy.isBoolean().run(true).pass).toBe(true);
  });

  it('pass for false', () => {
    expect(enforceLazy.isBoolean().run(false).pass).toBe(true);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'true', 'yes', {}, [], () => {}];

    values.forEach(value => {
      expect(enforceLazy.isBoolean().run(value).pass).toBe(false);
    });
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(enforceLazy.isBoolean().run(value).pass).toBe(false);
    });
  });

  describe('chain: isTrue', () => {
    it('pass only for true', () => {
      expect(enforceLazy.isBoolean().isTrue().run(true).pass).toBe(true);
    });

    it('fails for false', () => {
      expect(enforceLazy.isBoolean().isTrue().run(false).pass).toBe(false);
    });
  });

  describe('chain: isFalse', () => {
    it('pass only for false', () => {
      expect(enforceLazy.isBoolean().isFalse().run(false).pass).toBe(true);
    });

    it('fails for true', () => {
      expect(enforceLazy.isBoolean().isFalse().run(true).pass).toBe(false);
    });
  });

  describe('chain: equals', () => {
    it('pass when values match', () => {
      expect(enforceLazy.isBoolean().equals(true).run(true).pass).toBe(true);
      expect(enforceLazy.isBoolean().equals(false).run(false).pass).toBe(true);
    });

    it('fails when values differ', () => {
      expect(enforceLazy.isBoolean().equals(true).run(false).pass).toBe(false);
      expect(enforceLazy.isBoolean().equals(false).run(true).pass).toBe(false);
    });
  });

  describe('chain: isTruthy', () => {
    it('pass for true', () => {
      expect(enforceLazy.isBoolean().isTruthy().run(true).pass).toBe(true);
    });

    it('fails for false', () => {
      expect(enforceLazy.isBoolean().isTruthy().run(false).pass).toBe(false);
    });
  });

  describe('chain: isFalsy', () => {
    it('pass for false', () => {
      expect(enforceLazy.isBoolean().isFalsy().run(false).pass).toBe(true);
    });

    it('fails for true', () => {
      expect(enforceLazy.isBoolean().isFalsy().run(true).pass).toBe(false);
    });
  });
});
