import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isBoolean', () => {
  it('pass for true', () => {
    expect(enforce.isBoolean().run(true).pass).toBe(true);
  });

  it('pass for false', () => {
    expect(enforce.isBoolean().run(false).pass).toBe(true);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'true', 'yes', {}, [], () => {}];

    values.forEach(value => {
      expect(enforce.isBoolean().run(value).pass).toBe(false);
    });
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(enforce.isBoolean().run(value).pass).toBe(false);
    });
  });

  describe('chain: isTrue', () => {
    it('pass only for true', () => {
      expect(enforce.isBoolean().isTrue().run(true).pass).toBe(true);
    });

    it('fails for false', () => {
      expect(enforce.isBoolean().isTrue().run(false).pass).toBe(false);
    });
  });

  describe('chain: isFalse', () => {
    it('pass only for false', () => {
      expect(enforce.isBoolean().isFalse().run(false).pass).toBe(true);
    });

    it('fails for true', () => {
      expect(enforce.isBoolean().isFalse().run(true).pass).toBe(false);
    });
  });

  describe('chain: equals', () => {
    it('pass when values match', () => {
      expect(enforce.isBoolean().equals(true).run(true).pass).toBe(true);
      expect(enforce.isBoolean().equals(false).run(false).pass).toBe(true);
    });

    it('fails when values differ', () => {
      expect(enforce.isBoolean().equals(true).run(false).pass).toBe(false);
      expect(enforce.isBoolean().equals(false).run(true).pass).toBe(false);
    });
  });

  describe('chain: isTruthy', () => {
    it('pass for true', () => {
      expect(enforce.isBoolean().isTruthy().run(true).pass).toBe(true);
    });

    it('fails for false', () => {
      expect(enforce.isBoolean().isTruthy().run(false).pass).toBe(false);
    });
  });

  describe('chain: isFalsy', () => {
    it('pass for false', () => {
      expect(enforce.isBoolean().isFalsy().run(false).pass).toBe(true);
    });

    it('fails for true', () => {
      expect(enforce.isBoolean().isFalsy().run(true).pass).toBe(false);
    });
  });
});
