import { faker } from '@faker-js/faker';
import { noop } from 'vest-utils';

import { IsolateTest, TIsolateTest } from 'IsolateTest';
import { Severity } from 'Severity';
import { VestTestMutator } from 'VestTestMutator';
import { hasFailuresByTestObject } from 'hasFailuresByTestObjects';

const fieldName: string = faker.random.word();

describe('hasFailuresByTestObject', () => {
  let testObject: TIsolateTest;

  beforeEach(() => {
    const fieldName: string = faker.random.word();
    testObject = IsolateTest(noop, {
      fieldName,
      testFn: jest.fn(),
    });
  });

  describe('When test did not fail', () => {
    it('Should return false', () => {
      expect(hasFailuresByTestObject(testObject, Severity.ERRORS)).toBe(false);
      expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
        false
      );
      expect(
        hasFailuresByTestObject(testObject, Severity.ERRORS, fieldName)
      ).toBe(false);
    });
  });

  describe('When the test did fail', () => {
    beforeEach(() => {
      VestTestMutator.fail(testObject);
    });
    describe('When field name is not provided', () => {
      describe('When non matching severity profile', () => {
        it('should return false', () => {
          expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
            false
          );
          VestTestMutator.warn(testObject);
          expect(hasFailuresByTestObject(testObject, Severity.ERRORS)).toBe(
            false
          );
        });
      });

      describe('When matching severity profile', () => {
        it('Should return true', () => {
          expect(hasFailuresByTestObject(testObject, Severity.ERRORS)).toBe(
            true
          );
          VestTestMutator.warn(testObject);
          expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
            true
          );
        });
      });
    });
    describe('When field name is provided', () => {
      describe('When field name matches', () => {
        it('should return false', () => {
          expect(
            hasFailuresByTestObject(testObject, Severity.ERRORS, 'non_matching')
          ).toBe(false);
        });
      });

      describe('When field name matches', () => {
        it('Should continue with normal flow', () => {
          expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
            false
          );
          VestTestMutator.warn(testObject);
          expect(hasFailuresByTestObject(testObject, Severity.ERRORS)).toBe(
            false
          );
          VestTestMutator.fail(testObject);
          expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
            true
          );
        });
      });
    });
  });
});
