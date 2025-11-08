import { sample, random } from 'lodash';
import { describe, it, expect } from 'vitest';

import { TRUTHY_VALUES, FALSY_VALUES } from './anyoneTestValues';

import one from 'one';

describe('methods/one', () => {
  describe('When only falsy values', () => {
    it('Should return false', () => {
      expect(
        one(
          ...Array.from({ length: random(1, 10) }, (_, i) =>
            i % 2 === 0 ? sample(FALSY_VALUES) : sample(FALSY_VALUES),
          ),
        ),
      ).toBe(false);
    });
  });

  describe('When only truthy values', () => {
    it('Should return false', () => {
      expect(
        one(
          ...Array.from({ length: random(2, 10) }, (_, i) =>
            i % 2 === 0 ? sample(TRUTHY_VALUES) : sample(TRUTHY_VALUES),
          ),
        ),
      ).toBe(false);
    });
  });

  describe('When one truthy value', () => {
    it('Should return true', () => {
      expect(
        one(
          ...Array.from({ length: random(1, 10) }, (_, i) =>
            i % 2 === 0 ? sample(FALSY_VALUES) : sample(FALSY_VALUES),
          ),
          sample(TRUTHY_VALUES),
        ),
      ).toBe(true);
    });
  });

  describe('When some truthy values', () => {
    it('Should return false', () => {
      expect(
        one(
          ...Array.from({ length: random(2, 10) }, () => sample(TRUTHY_VALUES)),
          ...Array.from({ length: random(1, 10) }, () => sample(FALSY_VALUES)),
        ),
      ).toBe(false);
    });
  });
});
