import faker from 'faker';
import { noop } from 'lodash';
import mock from '../../../../../../shared/testUtils/mock';
import resetState from '../../../../testUtils/resetState';
import { dummyTest } from '../../../../testUtils/testDummy';
import { OPERATION_MODE_STATELESS } from '../../../constants';
import { get } from '../../../hooks';
import context from '../../context';
import { getSuite } from '../../state';
import create from '.';

describe('Test createSuite module', () => {
  describe('Test arguments', () => {
    let mockValidateSuiteParams, create, name, tests;

    beforeEach(() => {
      mockValidateSuiteParams = mock('validateSuiteParams');
      create = require('.');
      name = faker.random.word();
      tests = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('Should call `validateSuiteParams` with passed arguments and current function name', () => {
      expect(mockValidateSuiteParams).not.toHaveBeenCalled();
      create(name, tests);
      expect(mockValidateSuiteParams).toHaveBeenCalledWith(
        'vest.create',
        name,
        tests
      );
    });
  });

  describe('Return value', () => {
    it('should be a function', () => {
      expect(typeof create('suiteName', noop)).toBe('function');
    });

    test("returned function name is the suite's name", () => {
      expect(create('boop', noop).name).toBe('boop');
    });
  });

  describe('When returned function is invoked', () => {
    it('Calls `tests` argument', () =>
      new Promise(done => {
        const validate = create('FormName', done);
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
      const validate = create('FormName', testsCallback);
      validate(...params);
      expect(testsCallback).toHaveBeenCalledWith(...params);
    });
  });

  describe('Initial run', () => {
    const testsCb = jest.fn();
    const suiteId = 'initial_run_spec';
    const runCreateSuite = () => create(suiteId, testsCb);

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
      expect(Object.keys(state[0].tests)).toHaveLength(0);
      expect(Object.keys(state[0].groups)).toHaveLength(0);
      expect(Object.keys(state[0].doneCallbacks)).toHaveLength(0);
      expect(Object.keys(state[0].fieldCallbacks)).toHaveLength(0);

      expect(getSuite(suiteId)).toMatchSnapshot();
    });

    it('Should be able to get the suite from the result of createSuite', () => {
      const testsCb = jest.fn();
      const suiteId = 'test_get_suite';
      expect(create(suiteId, testsCb).get()).toBe(get(suiteId));
    });

    it('Should be able to reset the suite from the result of createSuite', () => {
      const suiteId = 'test_reset_suite';
      const testSuite = create(suiteId, () => {
        dummyTest.failing('f1', 'm1');
      });
      testSuite();
      expect(get(suiteId).hasErrors()).toBe(true);
      expect(get(suiteId).testCount).toBe(1);
      testSuite.reset();
      expect(get(suiteId).hasErrors()).toBe(false);
      expect(get(suiteId).testCount).toBe(0);
    });

    it('Should return without calling tests callback', () => {
      const validate = runCreateSuite();
      expect(testsCb).not.toHaveBeenCalled();
      validate();
      expect(testsCb).toHaveBeenCalled();
    });

    describe('When in stateless mode', () => {
      it('Should return without creating initial state', () => {
        context.run({ operationMode: OPERATION_MODE_STATELESS }, () => {
          runCreateSuite();
        });
      });
      expect(getSuite(suiteId)).toBeUndefined();
    });
  });
});
