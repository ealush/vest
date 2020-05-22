import { getState } from '../../src/core/state';
import { SYMBOL_SUITES } from '../../src/core/state/symbols';
import resetState from '.';

describe('resetState', () => {
  test('Sanity', () => {
    expect(getState()).toMatchSnapshot();
  });

  it('Should create a new state', () => {
    const initialState = getState();
    expect(getState()).toBe(initialState);
    resetState();

    expect(getState()).not.toBe(initialState);
  });

  describe('When invoked with suite name', () => {
    let suiteId;

    beforeEach(() => {
      suiteId = 'test-suite';
    });

    it('Should add a new suite to the state', () => {
      expect(getState(SYMBOL_SUITES)).toEqual({});
      resetState(suiteId);
      expect(getState(SYMBOL_SUITES)[suiteId]).toBeTruthy();
      expect(getState(SYMBOL_SUITES)[suiteId]).toMatchSnapshot();
    });
  });
});
