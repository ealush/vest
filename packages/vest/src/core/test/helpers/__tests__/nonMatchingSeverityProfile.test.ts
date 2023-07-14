import { noop } from 'vest-utils';

import { IsolateTest, TIsolateTest } from 'IsolateTest';
import { Severity } from 'Severity';
import { VestTestMutator } from 'VestTestMutator';
import { nonMatchingSeverityProfile } from 'nonMatchingSeverityProfile';

describe('nonMatchingSeverityProfile', () => {
  let testObject: TIsolateTest;

  beforeEach(() => {
    testObject = IsolateTest(noop, {
      fieldName: 'field',
      testFn: jest.fn(),
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
