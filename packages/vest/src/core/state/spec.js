import _ from 'lodash';
import resetState from '../../../testUtils/resetState';
import state from '.';

describe('Module: state', () => {
  beforeEach(() => {
    resetState();
  });

  describe('state.register', () => {
    describe('When state exists', () => {
      it('Should keep state untouched', () => {
        const prevState = state.get();
        const prevStateValue = _.cloneDeep(prevState);
        expect(prevStateValue).toMatchSnapshot();
        state.register();
        expect(state.get()).toEqual(prevStateValue);
        expect(state.get()).toBe(prevState);
      });
    });

    describe('When state does not exist', () => {
      beforeEach(() => {
        state.set(() => null);
      });

      it('Should keep state untouched', () => {
        expect(state.get()).toBeNull();
        resetState();
        expect(state.get()).not.toBeNull();
        expect(state.get()).toMatchSnapshot();
      });
    });
  });

  describe('state.get', () => {
    it('Should return state', () => {
      const currentState = {};
      state.set(() => currentState);
      expect(state.get()).toBe(currentState);
      state.set(() => null);

      // this checks the case when the state doesn't exist
      expect(state.get()).toBeNull();
    });
  });

  describe('setState', () => {
    let setter, prevState;
    beforeEach(() => {
      setter = jest.fn(() => ({
        k: 'v',
      }));
      prevState = state.get();
    });
    it('Should set value to the output of the setter argument', () => {
      state.set(setter);
      expect(state.get()).not.toBe(prevState);
      expect(state.get()).not.toEqual(prevState);
      expect(state.get()).toBe(setter.mock.results[0].value);
    });

    it('Should pass prevstate to setter arguments', () => {
      state.set(setter);
      expect(setter).toHaveBeenCalledWith(prevState);
    });

    it('Should return updated state', () => {
      expect(state.set(setter)).toBe(state.get());
    });
  });
});
