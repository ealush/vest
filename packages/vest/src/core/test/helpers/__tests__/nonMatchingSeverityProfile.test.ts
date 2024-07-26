import { nonMatchingSeverityProfile } from '../nonMatchingSeverityProfile';

import { TIsolateTest } from '@/core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '@/core/isolate/IsolateTest/VestTest';
import { Severity } from '@/suiteResult/Severity';
import { mockIsolateTest } from '@/testUtils/vestMocks';

describe('nonMatchingSeverityProfile', () => {
  let testObject: TIsolateTest;

  beforeEach(() => {
    testObject = mockIsolateTest({
      fieldName: 'field',
    });
  });
  describe('When matching', () => {
    describe('When both are warning', () => {
      it('should return false', () => {
        VestTest.warn(testObject);
        expect(nonMatchingSeverityProfile(Severity.WARNINGS, testObject)).toBe(
          false,
        );
      });
    });

    describe('When both are not warning', () => {
      it('should return false', () => {
        expect(nonMatchingSeverityProfile(Severity.ERRORS, testObject)).toBe(
          false,
        );
      });
    });
  });

  describe('When non matching', () => {
    describe('When test is warning', () => {
      it('should return true', () => {
        VestTest.warn(testObject);
        expect(nonMatchingSeverityProfile(Severity.ERRORS, testObject)).toBe(
          true,
        );
      });
    });

    describe('When severity is warning', () => {
      it('should return true', () => {
        expect(nonMatchingSeverityProfile(Severity.WARNINGS, testObject)).toBe(
          true,
        );
      });
    });
  });
});
