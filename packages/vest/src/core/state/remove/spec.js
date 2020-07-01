import _ from 'lodash';
import { getState, getSuites } from '..';
import vest from '../../../..';
import resetState from '../../../../testUtils/resetState';
import runRegisterSuite from '../../../../testUtils/runRegisterSuite';
import testDummy from '../../../../testUtils/testDummy';
import { KEY_CANCELED } from '../constants';
import getSuiteState from '../getSuiteState';
import remove from '.';

const suiteId = 'suite_id';
let state;

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
      runRegisterSuite({ name: suiteId, suiteId });
      state = _.cloneDeep(getState());
    });

    it('Should throw an error', () => {
      expect(state).toEqual(getState());
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
        const suiteState = getSuiteState(suiteId);
        expect(suiteState.lagging).toHaveLength(2);
        expect(suiteState.pending).toHaveLength(2);
        expect(suiteState.lagging[0].fieldName).toBe('field_1');
        expect(suiteState.pending[0].fieldName).toBe('field_2');
        expect(suiteState.lagging[1].fieldName).toBe('field_3');
        expect(suiteState.pending[1].fieldName).toBe('field_4');
        expect(getState()).toMatchSnapshot();
      }
    );

    it('Should remove suite from state', () => {
      expect(getSuites()).toHaveProperty(suiteId);
      expect(() => getSuiteState(suiteId)).not.toThrow();
      remove(suiteId);
      expect(() => getSuiteState(suiteId)).toThrow();
      expect(getSuites()).not.toHaveProperty(suiteId);
    });

    it('Should set all pending and lagging tests as canceled', () => {
      const previouslyCanceled = getState(KEY_CANCELED);
      const state = getSuiteState(suiteId);
      const allCanceled = [...state.lagging, ...state.pending].reduce(
        (canceled, { id }) => Object.assign(canceled, { [id]: true }),
        { ...previouslyCanceled }
      );
      expect(getState(KEY_CANCELED)).not.toEqual(allCanceled);
      remove(suiteId);
      expect(getState(KEY_CANCELED)).toEqual(allCanceled);
    });
  });
});
