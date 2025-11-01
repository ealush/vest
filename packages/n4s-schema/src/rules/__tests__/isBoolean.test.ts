import { describe, it, expect } from 'vitest';

import { isBoolean } from '../boolean/isBoolean';

describe('isBoolean', () => {
  it('passes for true', () => {
    expect(isBoolean().run(true).passes).toBe(true);
  });

  it('passes for false', () => {
    expect(isBoolean().run(false).passes).toBe(true);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'true', 'yes', {}, [], () => {}];

    values.forEach(value => {
      expect(isBoolean().run(value).passes).toBe(false);
    });
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(isBoolean().run(value).passes).toBe(false);
    });
  });

  describe('chain: isTrue', () => {
    it('passes only for true', () => {
      expect(isBoolean().isTrue().run(true).passes).toBe(true);
    });

    it('fails for false', () => {
      expect(isBoolean().isTrue().run(false).passes).toBe(false);
    });
  });

  describe('chain: isFalse', () => {
    it('passes only for false', () => {
      expect(isBoolean().isFalse().run(false).passes).toBe(true);
    });

    it('fails for true', () => {
      expect(isBoolean().isFalse().run(true).passes).toBe(false);
    });
  });

  describe('chain: equals', () => {
    it('passes when values match', () => {
      expect(isBoolean().equals(true).run(true).passes).toBe(true);
      expect(isBoolean().equals(false).run(false).passes).toBe(true);
    });

    it('fails when values differ', () => {
      expect(isBoolean().equals(true).run(false).passes).toBe(false);
      expect(isBoolean().equals(false).run(true).passes).toBe(false);
    });
  });

  describe('chain: isTruthy', () => {
    it('passes for true', () => {
      expect(isBoolean().isTruthy().run(true).passes).toBe(true);
    });

    it('fails for false', () => {
      expect(isBoolean().isTruthy().run(false).passes).toBe(false);
    });
  });

  describe('chain: isFalsy', () => {
    it('passes for false', () => {
      expect(isBoolean().isFalsy().run(false).passes).toBe(true);
    });

    it('fails for true', () => {
      expect(isBoolean().isFalsy().run(true).passes).toBe(false);
    });
  });
});
