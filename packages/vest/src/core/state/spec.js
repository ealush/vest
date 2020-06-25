import _ from 'lodash';
import resetState from '../../../testUtils/resetState';
import singleton from '../../lib/singleton';
import { KEY_STATE, KEY_CANCELED, KEY_SUITES } from './constants';
import state, { getState, setState, getStateKey } from '.';

describe('Module: state', () => {
  beforeEach(() => {
    resetState();
  });

  describe('state.register', () => {
    describe('When state exists', () => {
      it('Should keep state untouched', () => {
        const prevState = getState();
        const prevStateValue = _.cloneDeep(prevState);
        expect(prevStateValue).toMatchSnapshot();
        state.register();
        expect(getState()).toEqual(prevStateValue);
        expect(getState()).toBe(prevState);
      });
    });

    describe('When state does not exist', () => {
      beforeEach(() => {
        singleton.set(KEY_STATE, null);
      });

      it('Should keep state untouched', () => {
        expect(getState()).toBeNull();
        resetState();
        expect(getState()).not.toBeNull();
        expect(getState()).toMatchSnapshot();
      });
    });
  });

  describe('getState', () => {
    describe('When no key specified', () => {
      it('Should return state', () => {
        expect(getState()).toBe(singleton.use(KEY_STATE));
        singleton.set(KEY_STATE, null);

        // this checks the case when the tate doesn't exist
        expect(getState()).toBe(singleton.use(KEY_STATE));
      });
    });

    describe('When key specified', () => {
      it('Should return relevant state portion', () => {
        [KEY_CANCELED, KEY_SUITES].forEach(key => {
          expect(getStateKey(key)).toBe(singleton.use(KEY_STATE)[key]);
        });
      });
    });
  });

  describe('setState', () => {
    let setter, prevState;
    beforeEach(() => {
      setter = jest.fn(() => ({
        k: 'v',
      }));
      prevState = getState();
    });
    it('Should set value to the output of the setter argument', () => {
      setState(setter);
      expect(getState()).not.toBe(prevState);
      expect(getState()).not.toEqual(prevState);
      expect(getState()).toBe(setter.mock.results[0].value);
    });

    it('Should pass prevstate to setter arguments', () => {
      setState(setter);
      expect(setter).toHaveBeenCalledWith(prevState);
    });

    it('Should return updated state', () => {
      expect(setState(setter)).toBe(getState());
    });
  });
});
