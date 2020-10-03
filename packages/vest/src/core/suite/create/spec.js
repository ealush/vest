import faker from 'faker';
import { noop } from 'lodash';
import { dummyTest } from '../../../../testUtils/testDummy';
import create from '.';

describe('Test createSuite module', () => {
  describe('Test suite Arguments', () => {
    it('allows omitting suite name', () => {
      expect(typeof create(Function.prototype)).toBe('function');
      expect(create(Function.prototype).name).toBe('validate');
      expect(typeof create(Function.prototype).get).toBe('function');
      expect(typeof create(Function.prototype).reset).toBe('function');
      expect(create(Function.prototype).get()).toMatchSnapshot();
    });

    it.each([faker.random.word(), null, undefined, 0, 1, true, false, NaN, ''])(
      'Throws an error when `tests` callback is not a function',
      value => {
        expect(() => create(value)).toThrow(
          '[Vest]: Suite initialization error. Expected `tests` to be a function.'
        );
        expect(() => create('suite_name', value)).toThrow(
          '[Vest]: Suite initialization error. Expected `tests` to be a function.'
        );
      }
    );
  });

  describe('Return value', () => {
    it('should be a function', () => {
      expect(typeof create('suiteName', noop)).toBe('function');
    });

    test('returned function name is `validate`', () => {
      expect(create('boop', noop).name).toBe('validate');
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
    const genValidate = () => create('initial_run_spec', testsCb);

    it('Should initialize with an empty result object', () => {
      const validate = genValidate();
      expect(Object.keys(validate.get().tests)).toHaveLength(0);
      expect(Object.keys(validate.get().groups)).toHaveLength(0);

      expect(validate.get().errorCount).toBe(0);
      expect(validate.get().warnCount).toBe(0);
      expect(validate.get().testCount).toBe(0);

      expect(validate.get()).toMatchSnapshot();
    });

    it('Should be able to get the suite from the result of createSuite', () => {
      const testsCb = jest.fn();
      expect(create('test_get_suite', testsCb).get()).toMatchSnapshot();
    });

    it('Should be able to reset the suite from the result of createSuite', () => {
      const testSuite = create('test_reset_suite', () => {
        dummyTest.failing('f1', 'm1');
      });
      testSuite();
      expect(testSuite.get().hasErrors()).toBe(true);
      expect(testSuite.get().testCount).toBe(1);
      testSuite.reset();
      expect(testSuite.get().hasErrors()).toBe(false);
      expect(testSuite.get().testCount).toBe(0);
    });

    it('Should return without calling tests callback', () => {
      const validate = create(testsCb);
      expect(testsCb).not.toHaveBeenCalled();
      validate();
      expect(testsCb).toHaveBeenCalled();
    });
  });
});
