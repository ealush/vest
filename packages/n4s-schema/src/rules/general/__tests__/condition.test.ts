import { enforce } from 'n4s-schema';
import { describe, it, expect, vi } from 'vitest';

describe('enforce.condition', () => {
  it('Should pass down enforced value to condition as the first argument', () => {
    const condition = vi.fn(() => true);

    enforce(1).condition(condition);
    expect(condition).toHaveBeenCalledWith(1);

    enforce.condition(condition).run(2);
    expect(condition).toHaveBeenCalledWith(2);

    expect(enforce.condition((v: boolean) => v).run(true)).toEqual({
      pass: true,
      type: true,
    });
    expect(enforce.condition((v: boolean) => v).run(false)).toEqual({
      pass: false,
      type: false,
    });
  });

  describe('Lazy interface', () => {
    it('Should return a failing result if condition is failing', () => {
      expect(enforce.condition(() => false).run(1)).toEqual({
        pass: false,
        type: 1,
      });
    });

    it('Should return a passing result if condition is passing', () => {
      expect(enforce.condition(() => true).run(1)).toEqual({
        pass: true,
        type: 1,
      });
    });
  });

  describe('Eager interface', () => {
    it('Should throw an error if condition is failing', () => {
      expect(() => enforce(1).condition(() => false)).toThrow();

      expect(() => enforce(1).condition(() => false)).toThrow();

      expect(() => enforce(1).condition(() => false)).toThrow();
    });

    it('Should return silently if condition is passing', () => {
      expect(() => enforce(1).condition(() => true)).not.toThrow();

      expect(() => enforce(1).condition(() => true)).not.toThrow();

      expect(() => enforce(1).condition(() => true)).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('Should fail if not a function', () => {
      // Type test: - testing bad usage
      expect(() => enforce().condition('not a function')).toThrow();
      expect(enforce.condition('not a function').run(1)).toEqual({
        pass: false,
        type: 1,
      });
    });
  });
});
