import mockThrowError from '../../../../testUtils/mockThrowError';
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

  describe('When tests are passed in a different order between runs', () => {
    let deferThrow, vest;
    beforeEach(() => {
      const mock = mockThrowError();
      deferThrow = mock.deferThrow;
      vest = mock.vest;
    });

    afterAll(() => {
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
      expect(deferThrow).not.toHaveBeenCalled();

      suite();

      expect(deferThrow).toHaveBeenCalledWith(
        expect.stringContaining(
          'Vest Critical Error: Tests called in different order than previous run.'
        )
      );
    });

    describe('When test is omitted in subsequent run', () => {
      it('Should omit the test from the results', () => {
        const { create, test } = vest;
        suite = create(() => {
          test('f1', () => false);
          if (counter === 0) {
            test('f2', () => false);
          }
          test('f3', () => false);
          counter++;
        });

        const resA = suite();
        expect(resA.tests.f2).toBeDefined();
        expect(resA.hasErrors('f1')).toBe(true);
        expect(resA.hasErrors('f2')).toBe(true);
        expect(resA.hasErrors('f3')).toBe(true);
        expect(resA.tests).toMatchInlineSnapshot(`
          {
            "f1": {
              "errorCount": 1,
              "errors": [],
              "testCount": 1,
              "valid": false,
              "warnCount": 0,
              "warnings": [],
            },
            "f2": {
              "errorCount": 1,
              "errors": [],
              "testCount": 1,
              "valid": false,
              "warnCount": 0,
              "warnings": [],
            },
            "f3": {
              "errorCount": 1,
              "errors": [],
              "testCount": 1,
              "valid": false,
              "warnCount": 0,
              "warnings": [],
            },
          }
        `);

        const resB = suite();
        expect(resB.tests.f2).toBeUndefined();
        expect(resB.hasErrors('f1')).toBe(true);
        expect(resB.hasErrors('f2')).toBe(false);
        expect(resB.hasErrors('f3')).toBe(true);
        expect(resB.tests).toMatchInlineSnapshot(`
          {
            "f1": {
              "errorCount": 1,
              "errors": [],
              "testCount": 1,
              "valid": false,
              "warnCount": 0,
              "warnings": [],
            },
            "f3": {
              "errorCount": 1,
              "errors": [],
              "testCount": 1,
              "valid": false,
              "warnCount": 0,
              "warnings": [],
            },
          }
        `);
      });

      describe('When multiple tests are omitted between a test', () => {
        it('Should omit the tests from the results', () => {
          const { create, test } = vest;
          suite = create(() => {
            test('f1', () => false);
            if (counter === 0) {
              test('f2', () => false);
              test('f3', () => false);
            }
            test('f4', () => false);
            if (counter === 0) {
              test('f5', () => false);
              test('f6', () => false);
              test('f7', () => false);
            }
            test('f4', () => false);
            counter++;
          });

          const resA = suite();
          expect(resA.tests.f2).toBeDefined();
          expect(resA.tests.f3).toBeDefined();
          expect(resA.tests.f5).toBeDefined();
          expect(resA.tests.f6).toBeDefined();
          expect(resA.tests.f7).toBeDefined();
          expect(resA.hasErrors('f1')).toBe(true);
          expect(resA.hasErrors('f2')).toBe(true);
          expect(resA.hasErrors('f3')).toBe(true);
          expect(resA.hasErrors('f4')).toBe(true);
          expect(resA.hasErrors('f5')).toBe(true);
          expect(resA.hasErrors('f6')).toBe(true);
          expect(resA.hasErrors('f7')).toBe(true);
          expect(resA.tests).toMatchInlineSnapshot(`
            {
              "f1": {
                "errorCount": 1,
                "errors": [],
                "testCount": 1,
                "valid": false,
                "warnCount": 0,
                "warnings": [],
              },
              "f2": {
                "errorCount": 1,
                "errors": [],
                "testCount": 1,
                "valid": false,
                "warnCount": 0,
                "warnings": [],
              },
              "f3": {
                "errorCount": 1,
                "errors": [],
                "testCount": 1,
                "valid": false,
                "warnCount": 0,
                "warnings": [],
              },
              "f4": {
                "errorCount": 2,
                "errors": [],
                "testCount": 2,
                "valid": false,
                "warnCount": 0,
                "warnings": [],
              },
              "f5": {
                "errorCount": 1,
                "errors": [],
                "testCount": 1,
                "valid": false,
                "warnCount": 0,
                "warnings": [],
              },
              "f6": {
                "errorCount": 1,
                "errors": [],
                "testCount": 1,
                "valid": false,
                "warnCount": 0,
                "warnings": [],
              },
              "f7": {
                "errorCount": 1,
                "errors": [],
                "testCount": 1,
                "valid": false,
                "warnCount": 0,
                "warnings": [],
              },
            }
          `);
          const resB = suite();
          expect(resB.tests.f2).toBeUndefined();
          expect(resB.tests.f3).toBeUndefined();
          expect(resB.tests.f5).toBeUndefined();
          expect(resB.tests.f6).toBeUndefined();
          expect(resB.tests.f7).toBeUndefined();
          expect(resB.hasErrors('f1')).toBe(true);
          expect(resB.hasErrors('f2')).toBe(false);
          expect(resB.hasErrors('f3')).toBe(false);
          expect(resB.hasErrors('f4')).toBe(true);
          expect(resB.hasErrors('f5')).toBe(false);
          expect(resB.hasErrors('f6')).toBe(false);
          expect(resB.hasErrors('f7')).toBe(false);
          expect(resB.tests).toMatchInlineSnapshot(`
            {
              "f1": {
                "errorCount": 1,
                "errors": [],
                "testCount": 1,
                "valid": false,
                "warnCount": 0,
                "warnings": [],
              },
              "f4": {
                "errorCount": 2,
                "errors": [],
                "testCount": 2,
                "valid": false,
                "warnCount": 0,
                "warnings": [],
              },
            }
          `);
        });
      });

      describe('When tests are added inbetween tests', () => {
        it('Should remove next tests in line', () => {
          const { create, test, skipWhen } = vest;

          const suite = create(() => {
            test('f1', () => false);
            if (counter === 1) {
              test('f2', () => false);
              test('f3', () => false);
            }

            skipWhen(
              () => counter === 1,
              () => {
                test('f4', () => false);
                test('f5', () => false);
              }
            );
            counter++;
          });

          const resA = suite();
          expect(resA.hasErrors('f4')).toBe(true);
          expect(resA.hasErrors('f5')).toBe(true);

          // This is testing that fact that the next test in line after f2 and f3
          // got removed. We can see it because in normal situation, the test result is
          // merged into the next test result.
          const resB = suite();
          expect(resB.hasErrors('f4')).toBe(false);
          expect(resB.hasErrors('f5')).toBe(false);
        });
      });
    });
  });
});
