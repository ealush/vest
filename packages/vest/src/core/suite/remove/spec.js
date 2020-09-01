import _ from 'lodash';
import vest from '../../..';
import resetState from '../../../../testUtils/resetState';
import runRegister from '../../../../testUtils/runRegister';
import testDummy from '../../../../testUtils/testDummy';
import * as state from '../../state';
import { KEY_CANCELED, KEY_SUITES } from '../../state/constants';
import getState from '../getState';
import remove from '.';

const suiteId = 'suite_id';
let currentState;

describe('remove', () => {
  const createSuite = () =>
    vest.create(suiteId, skip => {
      vest.skip(skip);

      testDummy(vest).failingAsync('field_1', { time: 250 });

      testDummy(vest).failingAsync('field_2', { time: 250 });

      testDummy(vest).failingAsync('field_3', { time: 250 });

      testDummy(vest).failingAsync('field_4', { time: 250 });
    });

  beforeAll(() => {
    resetState();
  });
  describe('When invoked without suiteId', () => {
    it('Should throw', () => {
      expect(() => remove()).toThrow(
        '`vest.remove` must be called with suiteId'
      );
    });
  });

  describe('When suite does not exist in state', () => {
    beforeEach(() => {
      runRegister({ name: suiteId, suiteId });
      currentState = _.cloneDeep(state.get());
    });

    it('Should throw an error', () => {
      expect(currentState).toEqual(state.get());
      expect(() => remove('nonexistent_suite')).toThrow(Error);
    });
  });

  describe('When suite exists', () => {
    let validate;

    beforeEach(() => {
      validate = createSuite();
      validate('field_2');
      validate(['field_1', 'field_3']);
    });

    test.skipOnWatch(
      'Sanity - making sure everything works as it should',
      () => {
        const suiteState = getState(suiteId);
        expect(suiteState.lagging).toHaveLength(2);
        expect(suiteState.pending).toHaveLength(2);
        expect(suiteState.lagging[0].fieldName).toBe('field_1');
        expect(suiteState.pending[0].fieldName).toBe('field_2');
        expect(suiteState.lagging[1].fieldName).toBe('field_3');
        expect(suiteState.pending[1].fieldName).toBe('field_4');
        expect(state.get()).toMatchSnapshot();
      }
    );

    it('Should remove suite from state', () => {
      expect(state.get()[KEY_SUITES]).toHaveProperty(suiteId);
      expect(() => getState(suiteId)).not.toThrow();
      remove(suiteId);
      expect(() => getState(suiteId)).toThrow();
      expect(state.get()[KEY_SUITES]).not.toHaveProperty(suiteId);
    });

    it('Should set all pending and lagging tests as canceled', () => {
      const previouslyCanceled = state.get()[KEY_CANCELED];
      const currentState = getState(suiteId);
      const allCanceled = [
        ...currentState.lagging,
        ...currentState.pending,
      ].reduce((canceled, { id }) => Object.assign(canceled, { [id]: true }), {
        ...previouslyCanceled,
      });
      expect(state.get()[KEY_CANCELED]).not.toEqual(allCanceled);
      remove(suiteId);
      expect(state.get()[KEY_CANCELED]).toEqual(allCanceled);
    });
  });
});
