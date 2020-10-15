import { isTruthy } from '.';

describe('Tests isTruthy rule', () => {
  const values = [
    [0, false, 0],
    [null, false, 'null'],
    [undefined, false, 'undefined'],
    [false, false, 'false'],
    [{}, true, '{}'],
    [[], true, '[]'],
    ['', false, '""'],
    [1, true, 1],
    ['hi', true, 'hi'],
    [new Date(), true, 'new Date()'],
    [() => true, true, '() => true'],
    [[1], true, '[1]'],
  ];

  for (const set of values) {
    const value = set[0],
      expected = set[1],
      name = set[2];

    it(`The value ${name} with type ${typeof value}  Should return ${expected}`, () => {
      expect(isTruthy(value)).toBe(expected);
    });
  }
});
