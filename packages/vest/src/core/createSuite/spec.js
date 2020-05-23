import faker from 'faker';
import { noop } from 'lodash';
import mock from '../../../testUtils/mock';
import createSuite from '.';

describe('Test createSuite module', () => {
  describe('Test arguments', () => {
    let mockThrowError, createSuite;

    beforeEach(() => {
      mockThrowError = mock('throwError', msg => new Error(msg));
      createSuite = require('.');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it.each([[1, {}, noop]])(
      'Should throw a typerror error for a non string name.',
      value => {
        createSuite(value, noop);
        expect(mockThrowError).toHaveBeenCalledWith(
          'Suite initialization error. Expected name to be a string.',
          TypeError
        );
      }
    );

    it.each([[1, {}, 'noop']])(
      'Should throw a typerror error for a non function tests callback.',
      value => {
        createSuite(faker.random.word(), value);
        expect(mockThrowError).toHaveBeenCalledWith(
          'Suite initialization error. Expected tests to be a function.',
          TypeError
        );
      }
    );
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
