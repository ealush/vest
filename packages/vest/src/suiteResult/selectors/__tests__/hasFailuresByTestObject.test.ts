import { faker } from '@faker-js/faker';
import { TIsolateTest } from 'IsolateTest';
import { Severity } from 'Severity';
import { VestTest } from 'VestTest';
import { hasFailuresByTestObject } from 'hasFailuresByTestObjects';
import { mockIsolateTest } from 'vestMocks';
import { describe, it, expect, beforeEach } from 'vitest';

const fieldName: string = faker.lorem.word();

describe('hasFailuresByTestObject', () => {
  let testObject: TIsolateTest;

  beforeEach(() => {
    const fieldName: string = faker.lorem.word();
    testObject = mockIsolateTest({
      fieldName,
    });
  });

  describe('When test did not fail', () => {
    it('Should return false', () => {
      expect(hasFailuresByTestObject(testObject, Severity.ERRORS)).toBe(false);
      expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
        false,
      );
      expect(
        hasFailuresByTestObject(testObject, Severity.ERRORS, fieldName),
      ).toBe(false);
    });
  });

  describe('When the test did fail', () => {
    beforeEach(() => {
      VestTest.fail(testObject);
    });
    describe('When field name is not provided', () => {
      describe('When non matching severity profile', () => {
        it('should return false', () => {
          expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
            false,
          );
          VestTest.warn(testObject);
          expect(hasFailuresByTestObject(testObject, Severity.ERRORS)).toBe(
            false,
          );
        });
      });

      describe('When matching severity profile', () => {
        it('Should return true', () => {
          expect(hasFailuresByTestObject(testObject, Severity.ERRORS)).toBe(
            true,
          );
          VestTest.warn(testObject);
          expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
            true,
          );
        });
      });
    });
    describe('When field name is provided', () => {
      describe('When field name matches', () => {
        it('should return false', () => {
          expect(
            hasFailuresByTestObject(
              testObject,
              Severity.ERRORS,
              'non_matching',
            ),
          ).toBe(false);
        });
      });

      describe('When field name matches', () => {
        it('Should continue with normal flow', () => {
          expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
            false,
          );
          VestTest.warn(testObject);
          expect(hasFailuresByTestObject(testObject, Severity.ERRORS)).toBe(
            false,
          );
          VestTest.fail(testObject);
          expect(hasFailuresByTestObject(testObject, Severity.WARNINGS)).toBe(
            true,
          );
        });
      });
    });
  });
});
