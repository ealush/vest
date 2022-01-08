import { enforce } from 'enforce';
import { isValueOf, isNotValueOf } from 'isValueOf';

const objectToTest = {
  a: 'Alpha',
  b: 'Bravo',
  c: 'Charlie',
};

describe('isValueOf tests', () => {
  describe('When "Bravo" is the value of key "b"', () => {
    it('Should pass when used in enforce', () => {
      enforce('Bravo').isValueOf(objectToTest);
    });
    it('Should return true', () => {
      expect(isValueOf('Bravo', objectToTest)).toBe(true);
    });
  });
  describe('When "Delta" is not a value of any key', () => {
    expect(isValueOf('Delta', objectToTest)).toBe(false);
  });
});

describe('isNotValueOf tests', () => {
  describe('When "Delta" is not a value of any key', () => {
    it('Should return true using enforce', () => {
      enforce('Delta').isNotValueOf(objectToTest);
    });
    it('Should return true', () => {
      expect(isNotValueOf('Delta', objectToTest)).toBe(true);
    });
  });
  describe('When "Bravo" is the value of key "B"', () => {
    expect(isValueOf('Delta', objectToTest)).toBe(false);
  });
});
