import faker from 'faker';
import { noop } from 'lodash';
import mock from '../../../testUtils/mock';
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
});
