import { describe, it, expect } from 'vitest';

import { isFailure, isSuccess, unwrap } from '../Result';
import { toNumber } from '../toNumber';

describe('toNumber', () => {
  describe('Successful conversions', () => {
    it.each([
      [1, 1],
      [0, 0],
      [-1, -1],
      [1.5, 1.5],
      ['1', 1],
      ['0', 0],
      ['-1', -1],
      ['1.5', 1.5],
      [true, 1],
      [false, 0],
      [null, 0],
      ['', 0],
      ['   ', 0],
      [[], 0],
      [[1], 1],
    ])('should convert %s to %s', (input, expected) => {
      const result = toNumber(input);
      expect(isSuccess(result)).toBe(true);
      expect(unwrap(result)).toBe(expected);
    });
  });

  describe('Failed conversions', () => {
    it.each([undefined, 'abc', '1a', {}, [1, 2], NaN])(
      'should fail to convert %s',
      input => {
        expect(isFailure(toNumber(input))).toBe(true);
      },
    );
  });
});
