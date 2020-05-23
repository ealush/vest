import { getState, getSuites } from '..';
import resetState from '../../../../testUtils/resetState';
import runRegisterSuite from '../../../../testUtils/runRegisterSuite';
import runSpec from '../../../../testUtils/runSpec';
import vest from '../../../index';
import copy from '../../../lib/copy';
import getSuiteState from '../getSuiteState';
import { SYMBOL_CANCELED } from '../symbols';
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
    const { test } = vest;
    return vest.create(suiteId, skip => {
      vest.skip(skip);

      test('field_1', () =>
        new Promise((res, reject) => setTimeout(reject, 250)));

      test('field_2', () =>
        new Promise((res, reject) => setTimeout(reject, 250)));

      test('field_3', () =>
        new Promise((res, reject) => setTimeout(reject, 250)));

      test('field_4', () =>
        new Promise((res, reject) => setTimeout(reject, 250)));
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
    state;
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
        expect(getState()).toMatchSnapshot();
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
      const previouslyCanceled = getState(SYMBOL_CANCELED);
      const state = getSuiteState(suiteId);
      const allCanceled = [...state.lagging, ...state.pending].reduce(
        (canceled, { id }) => Object.assign(canceled, { [id]: true }),
        { ...previouslyCanceled }
      );
      expect(getState(SYMBOL_CANCELED)).not.toEqual(allCanceled);
      _reset(suiteId);
      expect(getState(SYMBOL_CANCELED)).toEqual(allCanceled);
    });
  });
};

// This tests the module when consumed through vest.reset();
runSpec(spec);

// This tests the module directly
spec();
