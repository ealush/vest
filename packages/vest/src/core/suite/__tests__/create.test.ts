import faker from 'faker';
import { noop } from 'lodash';

import { dummyTest } from '../../../../testUtils/testDummy';

import create from 'create';

describe('Test createSuite module', () => {
  describe('Test suite Arguments', () => {
    it('allows omitting suite name', () => {
      expect(typeof create(jest.fn())).toBe('function');
      expect(typeof create(jest.fn()).get).toBe('function');
      expect(typeof create(jest.fn()).reset).toBe('function');
      expect(typeof create(jest.fn()).remove).toBe('function');
      expect(create(jest.fn()).get()).toMatchSnapshot();
    });

    it.each([faker.random.word(), null, undefined, 0, 1, true, false, NaN, ''])(
      'Throws an error when `tests` callback is not a function',
      value => {
        expect(() => create(value)).toThrow(
          'vest.create: Expected callback to be a function.'
        );
      }
    );

    describe('When suite name is provided', () => {
      it('Should add suite name to suite result', () => {
        const res = create('form_name', () => {})();

        expect(res.suiteName).toBe('form_name');
      });
    });
  });

  describe('Return value', () => {
    it('should be a function', () => {
      expect(typeof create(noop)).toBe('function');
    });
  });

  describe('When returned function is invoked', () => {
    it('Calls `tests` argument', () =>
      new Promise<void>(done => {
        const validate = create(() => {
          done();
        });
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
      const validate = create(testsCallback);
      validate(...params);
      expect(testsCallback).toHaveBeenCalledWith(...params);
    });
  });

  describe('Initial run', () => {
    const testsCb = jest.fn();
    const genValidate = () => create(testsCb);

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
      expect(create(testsCb).get()).toMatchSnapshot();
    });

    it('Should be able to reset the suite from the result of createSuite', () => {
      const testSuite = create(() => {
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
