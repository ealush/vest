import faker from 'faker';
import { noop } from 'lodash';
import mock from '../../../../../shared/testUtils/mock';
import resetState from '../../../testUtils/resetState';
import { OPERATION_MODE_STATELESS } from '../../constants';
import runWithContext from '../../lib/runWithContext';
import { getSuite } from '../state';
import createSuite from '.';

describe('Test createSuite module', () => {
  describe('Test arguments', () => {
    let mockValidateSuiteParams, createSuite, name, tests;

    beforeEach(() => {
      mockValidateSuiteParams = mock('validateSuiteParams');
      createSuite = require('.');
      name = faker.random.word();
      tests = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('Should call `validateSuiteParams` with passed arguments and current function name', () => {
      expect(mockValidateSuiteParams).not.toHaveBeenCalled();
      createSuite(name, tests);
      expect(mockValidateSuiteParams).toHaveBeenCalledWith(
        'vest.create',
        name,
        tests
      );
    });
  });

  describe('Return value', () => {
    it('should be a function', () => {
      expect(typeof createSuite('suiteName', noop)).toBe('function');
    });

    test("returned function name is the suite's name", () => {
      expect(createSuite('boop', noop).name).toBe('boop');
    });
  });

  describe('When returned function is invoked', () => {
    it('Calls `tests` argument', () =>
      new Promise(done => {
        const validate = createSuite('FormName', done);
        validate();
      }));

    it('Passes all arguments over to tests callback', () => {
      const testsCallback = jest.fn();
      const params = [
        1,
        2,
        3,
        { [faker.random.word()]: [1, 2, 3] },
        false,
        [faker.random.word()],
      ];
      const validate = createSuite('FormName', testsCallback);
      validate(...params);
      expect(testsCallback).toHaveBeenCalledWith(...params);
    });
  });

  describe('Initial run', () => {
    const testsCb = jest.fn();
    const suiteId = 'initial_run_spec';
    const runCreateSuite = () => createSuite(suiteId, testsCb);

    afterEach(() => {
      resetState();
    });

    it('Should initialize with an empty state object', () => {
      expect(getSuite(suiteId)).toBeUndefined();
      runCreateSuite();
      const state = getSuite(suiteId);
      expect(state).toHaveLength(2);
      expect(state[1]).toBeUndefined();
      expect(state[0].suiteId).toBe(suiteId);
      expect(state[0].name).toBe(suiteId);
      expect(state[0].testObjects).toHaveLength(0);
      expect(state[0].pending).toHaveLength(0);
      expect(state[0].lagging).toHaveLength(0);
      expect(Object.keys(state[0].exclusion.groups)).toHaveLength(0);
      expect(Object.keys(state[0].exclusion.tests)).toHaveLength(0);
      expect(Object.keys(state[0].tests)).toHaveLength(0);
      expect(Object.keys(state[0].groups)).toHaveLength(0);
      expect(Object.keys(state[0].doneCallbacks)).toHaveLength(0);
      expect(Object.keys(state[0].fieldCallbacks)).toHaveLength(0);

      expect(getSuite(suiteId)).toMatchSnapshot();
    });

    it('Should return without calling tests callback', () => {
      const validate = runCreateSuite();
      expect(testsCb).not.toHaveBeenCalled();
      validate();
      expect(testsCb).toHaveBeenCalled();
    });

    describe('When in stateless mode', () => {
      it('Should return without creating initial state', () => {
        runWithContext({ operationMode: OPERATION_MODE_STATELESS }, () => {
          runCreateSuite();
        });
      });
      expect(getSuite(suiteId)).toBeUndefined();
    });
  });
});
