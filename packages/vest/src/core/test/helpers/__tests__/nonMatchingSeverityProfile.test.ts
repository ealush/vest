import { TIsolateTest } from 'IsolateTest';
import { Severity } from 'Severity';
import { VestTestMutator } from 'VestTestMutator';
import { nonMatchingSeverityProfile } from 'nonMatchingSeverityProfile';
import { mockIsolateTest } from 'vestMocks';

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
        VestTestMutator.warn(testObject);
        expect(nonMatchingSeverityProfile(Severity.WARNINGS, testObject)).toBe(
          false
        );
      });
    });

    describe('When both are not warning', () => {
      it('should return false', () => {
        expect(nonMatchingSeverityProfile(Severity.ERRORS, testObject)).toBe(
          false
        );
      });
    });
  });

  describe('When non matching', () => {
    describe('When test is warning', () => {
      it('should return true', () => {
        VestTestMutator.warn(testObject);
        expect(nonMatchingSeverityProfile(Severity.ERRORS, testObject)).toBe(
          true
        );
      });
    });

    describe('When severity is warning', () => {
      it('should return true', () => {
        expect(nonMatchingSeverityProfile(Severity.WARNINGS, testObject)).toBe(
          true
        );
      });
    });
  });
});
