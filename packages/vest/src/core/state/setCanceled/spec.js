import { getState } from '..';
import resetState from '../../../../testUtils/resetState';
import VestTest from '../../test/lib/VestTest';
import { SYMBOL_CANCELED } from '../symbols';
import setCanceled from '.';

describe('setCanceled', () => {
  beforeEach(() => {
    resetState();
  });

  it('Should add all passed ids to canceled object', () => {
    const tests = Array.from(
      { length: 5 },
      (_, i) => new VestTest('suite_id', `field_${i}`, 'msg', jest.fn())
    );

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
