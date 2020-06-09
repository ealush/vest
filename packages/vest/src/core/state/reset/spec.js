import { getState, getSuites } from '..';
import resetState from '../../../../testUtils/resetState';
import runRegisterSuite from '../../../../testUtils/runRegisterSuite';
import runSpec from '../../../../testUtils/runSpec';
import testDummy from '../../../../testUtils/testDummy';
import vest from '../../../index';
import copy from '../../../lib/copy';
import { KEY_CANCELED } from '../constants';
import getSuiteState from '../getSuiteState';
import reset from '.';

const suiteId = 'suite_id';
let state;

const spec = _vest => {
  let _reset;

  if (!_vest) {
    _reset = reset;
    _vest = vest;
  } else {
    _reset = _vest.reset;
  }

  const createSuite = () => {
    const vest = _vest;
    return vest.create(suiteId, skip => {
      vest.skip(skip);

      testDummy(vest).failingAsync('field_1', { time: 250 });

      testDummy(vest).failingAsync('field_2', { time: 250 });

      testDummy(vest).failingAsync('field_3', { time: 250 });

      testDummy(vest).failingAsync('field_4', { time: 250 });
    });
  };

  beforeAll(() => {
    resetState();
  });
  describe('When invoked without suiteId', () => {
    it('Should throw', () => {
      expect(() => reset()).toThrow('`vest.reset` must be called with suiteId');
    });
  });

  describe('When suite does not exist in state', () => {
    beforeEach(() => {
      runRegisterSuite({ name: suiteId, suiteId });
      state = copy(getState());
    });

    it('Should throw an error', () => {
      expect(state).toEqual(getState());
      expect(() => _reset('nonexistent_suite')).toThrow(Error);
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
      }
    );

    it('Should remove suite from state', () => {
      expect(getSuites()).toHaveProperty(suiteId);
      expect(() => getSuiteState(suiteId)).not.toThrow();
      _reset(suiteId);
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
      _reset(suiteId);
      expect(getState(KEY_CANCELED)).toEqual(allCanceled);
    });
  });
};

// This tests the module when consumed through vest.reset();
runSpec(spec);

// This tests the module directly
spec();
