import { faker } from '@faker-js/faker';
import { noop } from 'lodash';
import { describe, it, expect, vi } from 'vitest';

import { dummyTest } from '../../testUtils/testDummy';
import { TestPromise } from '../../testUtils/testPromise';

import { ErrorStrings } from '../../errors/ErrorStrings';
import { create } from '../../vest';

describe('Test createSuite module', () => {
  describe('Test suite Arguments', () => {
    it.each([faker.lorem.word(), null, undefined, 0, 1, true, false, NaN, ''])(
      'Throws an error when `tests` callback is not a function',
      value => {
        // @ts-expect-error - testing invalid input
        expect(() => create(value)).toThrow(
          ErrorStrings.SUITE_MUST_BE_INITIALIZED_WITH_FUNCTION,
        );
      },
    );
  });

  describe('Return value', () => {
    it('should expose Suite.run as a function', () => {
      expect(typeof create(noop).run).toBe('function');
    });
  });

  describe('When returned function is invoked', () => {
    it('Calls `tests` argument', () =>
      TestPromise(done => {
        const suite = create(() => {
          done();
        });
        suite.run();
      }));

    it('Passes all arguments over to tests callback', () => {
      const testsCallback = vi.fn();
      const params = [
        1,
        2,
        3,
        { [faker.lorem.word()]: [1, 2, 3] },
        false,
        [faker.lorem.word()],
      ];
      const suite = create(testsCallback);
      suite.run(...params);
      expect(testsCallback).toHaveBeenCalledWith(...params);
    });
  });

  describe('Initial run', () => {
    const testsCb = vi.fn();
    const genSuite = () => create(testsCb);

    it('should initialize with an empty result object', () => {
      const suite = genSuite();
      expect(Object.keys(suite.get().tests)).toHaveLength(0);
      expect(Object.keys(suite.get().groups)).toHaveLength(0);

      expect(suite.get().errorCount).toBe(0);
      expect(suite.get().warnCount).toBe(0);
      expect(suite.get().testCount).toBe(0);

      expect(suite.get()).toMatchSnapshot();
    });

    it('should be able to get the suite from the result of createSuite', () => {
      const testsCb = vi.fn();
      expect(create(testsCb).get()).toMatchSnapshot();
    });

    it('should be able to reset the suite from the result of createSuite', () => {
      const testSuite = create(() => {
        dummyTest.failing('f1', 'm1');
      });
      testSuite.run();
      expect(testSuite.get().hasErrors()).toBe(true);
      expect(testSuite.get().testCount).toBe(1);
      testSuite.reset();
      expect(testSuite.get().hasErrors()).toBe(false);
      expect(testSuite.get().testCount).toBe(0);
    });

    it('should return without calling the tests callback', () => {
      const suite = create(testsCb);
      expect(testsCb).not.toHaveBeenCalled();
      suite.run();
      expect(testsCb).toHaveBeenCalled();
    });
  });
});
