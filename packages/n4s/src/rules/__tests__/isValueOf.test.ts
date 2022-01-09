import { enforce } from 'enforce';
import { isValueOf, isNotValueOf } from 'isValueOf';

const testObject = {
  a: 'Bravo',
  b: false,
  c: 42,
};

const testObject2 = {
  d: {
    greet: 'hello',
  },
  e: null,
  f: undefined,
};

describe('isValueOf tests', () => {
  describe('When the value exists in the object', () => {
    it('Should return true using enforce', () => {
      enforce('Bravo').isValueOf(testObject);
      enforce(42).isValueOf(testObject);
      enforce(false).isValueOf(testObject);
      enforce(null).isValueOf(testObject2);
      enforce(undefined).isValueOf(testObject2);
    });

    it('Should return true', () => {
      expect(isValueOf('Bravo', testObject)).toBe(true);
      expect(isValueOf(42, testObject)).toBe(true);
      expect(isValueOf(false, testObject)).toBe(true);
      expect(isValueOf(null, testObject2)).toBe(true);
      expect(isValueOf(undefined, testObject2)).toBe(true);
    });
  });
  describe('When the value does not exist in the object', () => {
    it('Should return false', () => {
      expect(isValueOf('Alpha', testObject)).toBe(false);
      expect(isValueOf(1, testObject)).toBe(false);
      expect(isValueOf(true, testObject)).toBe(false);
      expect(isValueOf(null, testObject)).toBe(false);
      expect(isValueOf({ greet: 'hello' }, testObject2)).toBe(false);
    });

    it('Should throw using enforce', () => {
      expect(() => enforce('Alpha').isValueOf(testObject)).toThrow();
      expect(() => enforce(null).isValueOf(testObject)).toThrow();
    });
  });
});

describe('isNotValueOf tests', () => {
  describe('When the value does not exist in the object', () => {
    it('Should return true using enforce', () => {
      enforce('Delta').isNotValueOf(testObject);
    });
    it('Should return true', () => {
      expect(isNotValueOf('Alpha', testObject)).toBe(true);
      expect(isNotValueOf(1, testObject)).toBe(true);
      expect(isNotValueOf(true, testObject)).toBe(true);
      expect(isNotValueOf(null, testObject)).toBe(true);
    });
  });
  describe('When the value exists in the object', () => {
    it('Should return false', () => {
      expect(isNotValueOf('Bravo', testObject)).toBe(false);
    });
    it('Should throw using enforce', () => {
      expect(() => enforce(42).isNotValueOf(testObject)).toThrow();
    });
  });
});
