import resetState from '../../../../../testUtils/resetState';
import { getState } from '../../../state';
import { SYMBOL_CANCELED } from '../../../state/symbols';
import VestTest from '../VestTest';
import { setCanceled, removeCanceled } from '.';

const genTests = () =>
  Array.from(
    { length: 5 },
    (_, i) => new VestTest('suite_id', `field_${i}`, 'msg', jest.fn())
  );

let tests;

describe('module: canceled', () => {
  beforeEach(() => {
    resetState();
    tests = genTests();
  });

  describe('setCanceled', () => {
    it('Should add all passed ids to canceled object', () => {
      const ids = tests.map(({ id }) => id);
      expect(Object.keys(getState(SYMBOL_CANCELED))).not.toEqual(
        expect.arrayContaining(ids)
      );
      setCanceled(...tests);
      expect(Object.keys(getState(SYMBOL_CANCELED))).toEqual(
        expect.arrayContaining(ids)
      );
    });
  });

  describe('removeCanceled', () => {
    beforeEach(() => {
      setCanceled(...tests);
    });

    it('Should remove canceled test', () => {
      expect(getState(SYMBOL_CANCELED)).toHaveProperty(tests[0].id);
      removeCanceled(tests[0]);
      expect(getState(SYMBOL_CANCELED)).not.toHaveProperty(tests[0].id);
    });
  });
});
