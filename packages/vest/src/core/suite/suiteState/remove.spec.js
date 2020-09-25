import _ from 'lodash';
import vest from '../../..';
import resetState from '../../../../testUtils/resetState';
import runRegisterSuite from '../../../../testUtils/runRegisterSuite';
import testDummy from '../../../../testUtils/testDummy';
import state from '../../state';
import { KEY_CANCELED, KEY_SUITES } from '../../state/constants';
import * as suiteState from '.';

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
      expect(() => suiteState.remove()).toThrow(
        '`vest.remove` must be called with suiteId'
      );
    });
  });

  describe('When suite does not exist in state', () => {
    beforeEach(() => {
      runRegisterSuite({ name: suiteId, suiteId });
      currentState = _.cloneDeep(state.get());
    });

    it('Should throw an error', () => {
      expect(currentState).toEqual(state.get());
      expect(() => suiteState.remove('nonexistent_suite')).toThrow(Error);
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
        const currentState = suiteState.getCurrentState(suiteId);
        expect(currentState.lagging).toHaveLength(2);
        expect(currentState.pending).toHaveLength(2);
        expect(currentState.lagging[0].fieldName).toBe('field_1');
        expect(currentState.pending[0].fieldName).toBe('field_2');
        expect(currentState.lagging[1].fieldName).toBe('field_3');
        expect(currentState.pending[1].fieldName).toBe('field_4');
        expect(state.get()).toMatchSnapshot();
      }
    );

    it('Should remove suite from state', () => {
      expect(state.get()[KEY_SUITES]).toHaveProperty(suiteId);
      expect(() => suiteState.getCurrentState(suiteId)).not.toThrow();
      suiteState.remove(suiteId);
      expect(() => suiteState.getCurrentState(suiteId)).toThrow();
      expect(state.get()[KEY_SUITES]).not.toHaveProperty(suiteId);
    });

    it('Should set all pending and lagging tests as canceled', () => {
      const previouslyCanceled = state.get()[KEY_CANCELED];
      const currentState = suiteState.getCurrentState(suiteId);
      const allCanceled = [
        ...currentState.lagging,
        ...currentState.pending,
      ].reduce((canceled, { id }) => Object.assign(canceled, { [id]: true }), {
        ...previouslyCanceled,
      });
      expect(state.get()[KEY_CANCELED]).not.toEqual(allCanceled);
      suiteState.remove(suiteId);
      expect(state.get()[KEY_CANCELED]).toEqual(allCanceled);
    });
  });
});
