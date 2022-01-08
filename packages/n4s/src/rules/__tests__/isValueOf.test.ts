import { enforce } from 'enforce';

const objectToTest = {
  a: 'Alpha',
  b: 'Bravo',
  c: 'Charlie',
} as Object;

describe('isValueOf', () => {
  it('Should pass as "Bravo" is the value of key "b"', () => {
    enforce('Bravo').isValueOf(objectToTest);
  });
});

describe('isNotValueOf', () => {
  it('Should pass "Delta" is not a value of any key in the object', () => {
    enforce('Delta').isNotValueOf(objectToTest);
  });
});
