import { getState, getStateKey } from '../../src/core/state';
import { KEY_SUITES } from '../../src/core/state/constants';
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
      expect(getStateKey(KEY_SUITES)).toEqual({});
      resetState(suiteId);
      expect(getStateKey(KEY_SUITES)[suiteId]).toBeTruthy();
      expect(getStateKey(KEY_SUITES)[suiteId]).toMatchSnapshot();
    });
  });
});
