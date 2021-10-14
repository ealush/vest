import { dummyTest } from '../../../../testUtils/testDummy';

import { create, skipWhen } from 'vest';

describe('Merging of previous test runs', () => {
  let suite;
  let counter = 0;
  let testContainer = [];

  beforeEach(() => {
    counter = 0;
    testContainer = [];
  });
  describe('When test skipped in subsequent run', () => {
    it('Should merge its result from previous runs', () => {
      suite = create(() => {
        skipWhen(counter === 1, () => {
          testContainer.push([
            dummyTest.failing('f1'),
            dummyTest.failing('f2'),
            dummyTest.passing('f3'),
            dummyTest.failingWarning('f5'),
            dummyTest.passingWarning('f6'),
          ]);
        });
        counter++;
      });

      const resA = suite();
      const resB = suite();

      const [testsA, testsB] = testContainer;

      // This checks the the suite result is the same for both runs
      expect(resA).isDeepCopyOf(resB);

      // This checks that the test objects are the same for both runs
      expect(testsA).toEqual(testsB);
    });
  });

  describe('When test changes in subsequent run', () => {
    it('Should update the result accordingly', () => {
      suite = create(() => {
        testContainer.push(
          counter === 0 ? dummyTest.passing('f1') : dummyTest.failing('f1')
        );

        dummyTest.failing('f2');
        counter++;
      });

      const resA = suite();

      // Checking that the result is correct
      expect(resA.isValid('f1')).toBe(true);
      expect(resA.isValid('f2')).toBe(false);
      const resB = suite();
      // Checking that the result is correct
      expect(resB.isValid('f1')).toBe(false);
      expect(resA.isValid('f2')).toBe(false);

      const [f1A, f1B] = testContainer;

      // Checking that the result updated
      expect(resA).not.isDeepCopyOf(resB);

      // Checking that the test updated
      expect(f1A).not.toBe(f1B);
    });
  });

  describe('When tests are passed in a different order between tests', () => {
    let throwErrorDeferred, vest;
    beforeEach(() => {
      throwErrorDeferred = jest.fn();
      jest.resetModules();
      jest.mock('throwError', () => ({
        throwErrorDeferred,
        default: jest.fn(),
      }));
      vest = require('vest');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('Should defer-throw an error', () => {
      const { create, test } = vest;
      suite = create(() => {
        testContainer.push(
          counter === 0 ? test('f1', jest.fn()) : test('f2', () => false)
        );
        counter++;
      });

      suite();
      expect(throwErrorDeferred).not.toHaveBeenCalled();

      suite();

      expect(throwErrorDeferred).toHaveBeenCalledWith(
        expect.stringContaining(
          'Vest Critical Error: Tests called in different order than previous run.'
        )
      );
    });
  });
});
