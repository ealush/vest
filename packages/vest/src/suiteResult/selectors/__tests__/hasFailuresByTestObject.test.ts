import { faker } from '@faker-js/faker';
import { makeBrand } from 'vest-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import { TIsolateTest } from '../../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../../core/isolate/IsolateTest/VestTest';
import { mockIsolateTest } from '../../../testUtils/vestMocks';
import { Severity } from '../../Severity';
import { TFieldName } from '../../SuiteResultTypes';
import { hasFailuresByTestObject } from '../hasFailuresByTestObjects';

const generateFieldName = (): TFieldName =>
  makeBrand<TFieldName>(faker.lorem.word());
const fieldName = generateFieldName();

describe('hasFailuresByTestObject', () => {
  let testObject: TIsolateTest;

  beforeEach(() => {
    const fieldName = generateFieldName();
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
              makeBrand<TFieldName>('non_matching'),
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
