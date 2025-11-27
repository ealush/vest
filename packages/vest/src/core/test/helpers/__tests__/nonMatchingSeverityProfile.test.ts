import { describe, it, expect, beforeEach } from 'vitest';

import { Severity } from '../../../../suiteResult/Severity';
import { mockIsolateTest } from '../../../../testUtils/vestMocks';
import { TIsolateTest } from '../../../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../../isolate/IsolateTest/VestTest';
import { nonMatchingSeverityProfile } from '../nonMatchingSeverityProfile';

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
        expect(
          nonMatchingSeverityProfile(Severity.WARNINGS, testObject).unwrap(),
        ).toBe(false);
      });
    });

    describe('When both are not warning', () => {
      it('should return false', () => {
        expect(
          nonMatchingSeverityProfile(Severity.ERRORS, testObject).unwrap(),
        ).toBe(false);
      });
    });
  });

  describe('When non matching', () => {
    describe('When test is warning', () => {
      it('should return true', () => {
        VestTest.warn(testObject);
        expect(
          nonMatchingSeverityProfile(Severity.ERRORS, testObject).unwrap(),
        ).toBe(true);
      });
    });

    describe('When severity is warning', () => {
      it('should return true', () => {
        expect(
          nonMatchingSeverityProfile(Severity.WARNINGS, testObject).unwrap(),
        ).toBe(true);
      });
    });
  });
});
