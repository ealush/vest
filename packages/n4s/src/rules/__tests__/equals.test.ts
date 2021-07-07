import { random, datatype } from 'faker';
import { sample } from 'lodash';

import { equals } from 'equals';

const VALUES = [
  random.word(),
  datatype.number(),
  { [random.objectElement()]: random.word() },
  [random.arrayElement()],
  datatype.boolean(),
];

const LOOSE_PAIRS = [
  [1, '1'],
  [1, true],
  [false, 0],
  [undefined, null],
];

describe('Equals rule', () => {
  it('Should return true for same value', () => {
    VALUES.forEach(value => expect(equals(value, value)).toBe(true));
  });

  it('Should return true for same different value', () => {
    VALUES.forEach(value => {
      let sampled = value;

      // consistently produce a different value
      while (sampled === value) {
        sampled = sample(VALUES);
      }

      expect(equals(value, sampled)).toBe(false);
    });
  });

  it('Should treat loose equality as false', () => {
    LOOSE_PAIRS.forEach(pair => expect(equals(pair[0], pair[1])).toBe(false));
  });
});
