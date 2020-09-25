import state from '../../src/core/state';
import { KEY_SUITES } from '../../src/core/state/constants';
import * as suiteState from '../../src/core/suite/suiteState';
import resetState from '.';

describe('resetState', () => {
  test('Sanity', () => {
    expect(state.get()).toMatchSnapshot();
  });

  it('Should create a new state', () => {
    const initialState = state.get();
    expect(state.get()).toBe(initialState);
    resetState();

    expect(state.get()).not.toBe(initialState);
  });

  describe('When invoked with suite name', () => {
    let suiteId;

    beforeEach(() => {
      suiteId = 'test-suite';
    });

    it('Should add a new suite to the state', () => {
      expect(state.get()[KEY_SUITES]).toEqual({});
      resetState(suiteId);
      expect(suiteState.getSuite(suiteId)).toBeTruthy();
      expect(suiteState.getSuite(suiteId)).toMatchSnapshot();
    });
  });
});
