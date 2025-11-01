import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isBoolean', () => {
  it('passes for true', () => {
    expect(enforceLazy.isBoolean().run(true).passes).toBe(true);
  });

  it('passes for false', () => {
    expect(enforceLazy.isBoolean().run(false).passes).toBe(true);
  });

  it('fails for truthy non-boolean values', () => {
    const values: any[] = [1, 'true', 'yes', {}, [], () => {}];

    values.forEach(value => {
      expect(enforceLazy.isBoolean().run(value).passes).toBe(false);
    });
  });

  it('fails for falsy non-boolean values', () => {
    const values: any[] = [0, '', null, undefined, NaN];

    values.forEach(value => {
      expect(enforceLazy.isBoolean().run(value).passes).toBe(false);
    });
  });

  describe('chain: isTrue', () => {
    it('passes only for true', () => {
      expect(enforceLazy.isBoolean().isTrue().run(true).passes).toBe(true);
    });

    it('fails for false', () => {
      expect(enforceLazy.isBoolean().isTrue().run(false).passes).toBe(false);
    });
  });

  describe('chain: isFalse', () => {
    it('passes only for false', () => {
      expect(enforceLazy.isBoolean().isFalse().run(false).passes).toBe(true);
    });

    it('fails for true', () => {
      expect(enforceLazy.isBoolean().isFalse().run(true).passes).toBe(false);
    });
  });

  describe('chain: equals', () => {
    it('passes when values match', () => {
      expect(enforceLazy.isBoolean().equals(true).run(true).passes).toBe(true);
      expect(enforceLazy.isBoolean().equals(false).run(false).passes).toBe(
        true,
      );
    });

    it('fails when values differ', () => {
      expect(enforceLazy.isBoolean().equals(true).run(false).passes).toBe(
        false,
      );
      expect(enforceLazy.isBoolean().equals(false).run(true).passes).toBe(
        false,
      );
    });
  });

  describe('chain: isTruthy', () => {
    it('passes for true', () => {
      expect(enforceLazy.isBoolean().isTruthy().run(true).passes).toBe(true);
    });

    it('fails for false', () => {
      expect(enforceLazy.isBoolean().isTruthy().run(false).passes).toBe(false);
    });
  });

  describe('chain: isFalsy', () => {
    it('passes for false', () => {
      expect(enforceLazy.isBoolean().isFalsy().run(false).passes).toBe(true);
    });

    it('fails for true', () => {
      expect(enforceLazy.isBoolean().isFalsy().run(true).passes).toBe(false);
    });
  });
});
