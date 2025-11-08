import { sample, random } from 'lodash';
import { describe, it, expect } from 'vitest';

import { TRUTHY_VALUES, FALSY_VALUES } from './anyoneTestValues';

import all from 'all';

describe('methods/all', () => {
  describe('When only falsy values', () => {
    it('Should return false', () => {
      expect(
        all(
          ...Array.from({ length: random(1, 10) }, (_, i) =>
            i % 2 === 0 ? sample(FALSY_VALUES) : sample(FALSY_VALUES),
          ),
        ),
      ).toBe(false);
    });
  });

  describe('When only truthy values', () => {
    it('Should return true', () => {
      expect(
        all(
          ...Array.from({ length: random(1, 10) }, (_, i) =>
            i % 2 === 0 ? sample(TRUTHY_VALUES) : sample(TRUTHY_VALUES),
          ),
        ),
      ).toBe(true);
    });
  });

  describe('When some truthy values', () => {
    it('Should return false', () => {
      expect(
        all.apply(null, [
          ...Array.from({ length: random(1, 10) }, (_, i) =>
            i % 2 === 0 ? sample(FALSY_VALUES) : sample(FALSY_VALUES),
          ),
          ...Array.from({ length: random(1, 10) }, (_, i) =>
            i % 2 === 0 ? sample(TRUTHY_VALUES) : sample(TRUTHY_VALUES),
          ),
        ]),
      ).toBe(false);
    });
  });
});
