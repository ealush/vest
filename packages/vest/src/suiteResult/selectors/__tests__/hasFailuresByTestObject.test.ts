import { faker } from '@faker-js/faker';

import { Severity } from 'Severity';
import { VestTest } from 'VestTest';
import { hasFailuresByTestObject } from 'hasFailuresByTestObjects';

const fieldName: string = faker.random.word();

describe('hasFailuresByTestObject', () => {
  let testObject: VestTest;

  beforeEach(() => {
    const fieldName: string = faker.random.word();
    testObject = new VestTest(fieldName, jest.fn());
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
      testObject.fail();
    });
    describe('When field name is not provided', () => {
      describe('When non matching severity profile', () => {
        it('should return false', () => {
          expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
            false
          );
          testObject.warn();
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
          testObject.warn();
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
          testObject.warn();
          expect(hasFailuresByTestObject(testObject, Severity.ERRORS)).toBe(
            false
          );
          testObject.fail();
          expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
            true
          );
        });
      });
    });
  });
});
