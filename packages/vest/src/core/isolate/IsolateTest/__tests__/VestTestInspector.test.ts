import { TIsolateTest } from 'IsolateTest';
import { TestStatus } from 'IsolateTestStateMachine';
import { VestTest } from 'VestTest';
import { mockIsolateTest } from 'vestMocks';
import { describe, it, expect, beforeEach } from 'vitest';

describe('VestTest', () => {
  let testObject: TIsolateTest;

  beforeEach(() => {
    testObject = mockIsolateTest({
      fieldName: 'field_name',
    });
  });
  describe('warns', () => {
    it('Should return true when test severity is WARNING', () => {
      VestTest.warn(testObject);

      expect(VestTest.warns(testObject)).toBe(true);
    });

    it('Should return false when test is not warning', () => {
      expect(VestTest.warns(testObject)).toBe(false);
    });
  });

  describe('isPending', () => {
    it('Should return true when test status is PENDING', () => {
      VestTest.setPending(testObject);
      expect(VestTest.isPending(testObject)).toBe(true);
    });

    it('Should return false when test is not pending', () => {
      expect(VestTest.isPending(testObject)).toBe(false);
    });
  });

  describe('isOmitted', () => {
    it('Should return true when test status is OMITTED', () => {
      VestTest.omit(testObject);
      expect(VestTest.isOmitted(testObject)).toBe(true);
    });

    it('Should return false when test is not omitted', () => {
      expect(VestTest.isOmitted(testObject)).toBe(false);
    });
  });

  describe('isUntested', () => {
    it('Should return true when test status is UNTESTED', () => {
      expect(VestTest.isUntested(testObject)).toBe(true);
    });

    it('Should return false when test is not untested', () => {
      VestTest.setPending(testObject);
      expect(VestTest.isUntested(testObject)).toBe(false);
      VestTest.skip(testObject);
      expect(VestTest.isUntested(testObject)).toBe(false);
      VestTest.omit(testObject);
      expect(VestTest.isUntested(testObject)).toBe(false);
    });
  });

  describe('isFailing', () => {
    it('Should return true when test status is FAIL', () => {
      VestTest.fail(testObject);
      expect(VestTest.isFailing(testObject)).toBe(true);
    });

    it('Should return false when test is not failing', () => {
      expect(VestTest.isFailing(testObject)).toBe(false);
    });
  });

  describe('isCanceled', () => {
    it('Should return true when test status is CANCELED', () => {
      VestTest.cancel(testObject);
      expect(VestTest.isCanceled(testObject)).toBe(true);
    });

    it('Should return false when test is not canceled', () => {
      expect(VestTest.isCanceled(testObject)).toBe(false);
    });
  });

  describe('isSkipped', () => {
    it('Should return true when test status is SKIP', () => {
      VestTest.skip(testObject);
      expect(VestTest.isSkipped(testObject)).toBe(true);
    });

    it('Should return false when test is not skipped', () => {
      expect(VestTest.isSkipped(testObject)).toBe(false);
    });
  });

  describe('isPassing', () => {
    it('Should return true when test status is PASS', () => {
      VestTest.pass(testObject);
      expect(VestTest.isPassing(testObject)).toBe(true);
    });

    it('Should return false when test is not passing', () => {
      expect(VestTest.isPassing(testObject)).toBe(false);
    });
  });

  describe('isWarning', () => {
    it('Should return true when test severity is WARNING and the test is failing', () => {
      VestTest.warn(testObject);
      VestTest.fail(testObject);
      expect(VestTest.isWarning(testObject)).toBe(true);
    });

    it('Should return false when test is not actively warning', () => {
      VestTest.warn(testObject);
      expect(VestTest.isWarning(testObject)).toBe(false);
    });
  });

  describe('hasFailures', () => {
    it('Should return true when test has Error failures', () => {
      VestTest.fail(testObject);
      expect(VestTest.hasFailures(testObject)).toBe(true);
    });

    it('Should return true when test has Warning failures', () => {
      VestTest.warn(testObject);
      VestTest.fail(testObject);
      expect(VestTest.hasFailures(testObject)).toBe(true);
    });

    it('Should return false when test has no failures', () => {
      expect(VestTest.hasFailures(testObject)).toBe(false);
    });
  });

  describe('isNonActionable', () => {
    it('Should return true when the test is skipped', () => {
      VestTest.skip(testObject);
      expect(VestTest.isNonActionable(testObject)).toBe(true);
    });

    it('Should return true when the test is omitted', () => {
      VestTest.omit(testObject);
      expect(VestTest.isNonActionable(testObject)).toBe(true);
    });

    it('Should return true when the test is canceled', () => {
      VestTest.cancel(testObject);
      expect(VestTest.isNonActionable(testObject)).toBe(true);
    });

    it('Should return false when the test is not non-actionable', () => {
      expect(VestTest.isNonActionable(testObject)).toBe(false);
      VestTest.setPending(testObject);
      expect(VestTest.isNonActionable(testObject)).toBe(false);
      VestTest.fail(testObject);
      expect(VestTest.isNonActionable(testObject)).toBe(false);
    });
  });

  describe('isTested', () => {
    it('Should return true when the test has done testing', () => {
      VestTest.fail(testObject);
      expect(VestTest.isTested(testObject)).toBe(true);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTest.warn(testObject);
      VestTest.fail(testObject);
      expect(VestTest.isTested(testObject)).toBe(true);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTest.pass(testObject);

      expect(VestTest.isTested(testObject)).toBe(true);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTest.warn(testObject);
      VestTest.pass(testObject);
      expect(VestTest.isTested(testObject)).toBe(true);
    });

    it('Should return false when the test is untested', () => {
      expect(VestTest.isTested(testObject)).toBe(false);
      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTest.omit(testObject);
      expect(VestTest.isTested(testObject)).toBe(false);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTest.skip(testObject);
      expect(VestTest.isTested(testObject)).toBe(false);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTest.setPending(testObject);
      expect(VestTest.isTested(testObject)).toBe(false);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTest.cancel(testObject);
      expect(VestTest.isTested(testObject)).toBe(false);
    });
  });

  describe('awaitsResolution', () => {
    it('Should return true for a skipped test', () => {
      VestTest.skip(testObject);
      expect(VestTest.awaitsResolution(testObject)).toBe(true);
    });

    it('Should return true for an untetsted test', () => {
      expect(VestTest.awaitsResolution(testObject)).toBe(true);
      testObject = mockIsolateTest({ fieldName: 'f' });
    });

    it('Should return true for a pending test', () => {
      VestTest.setPending(testObject);
      expect(VestTest.awaitsResolution(testObject)).toBe(true);
    });

    it('Should return false for a tested test', () => {
      VestTest.fail(testObject);
      expect(VestTest.awaitsResolution(testObject)).toBe(false);
      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTest.pass(testObject);
      expect(VestTest.awaitsResolution(testObject)).toBe(false);
    });

    it('Should return false for a canceled test', () => {
      VestTest.cancel(testObject);
      expect(VestTest.awaitsResolution(testObject)).toBe(false);
    });

    it('Should return false for an omitted test', () => {
      VestTest.omit(testObject);
      expect(VestTest.awaitsResolution(testObject)).toBe(false);
    });
  });

  describe('statusEquals', () => {
    it('Should return true when test status equals the provided status', () => {
      VestTest.fail(testObject);
      expect(VestTest.statusEquals(testObject, TestStatus.FAILED)).toBe(true);
      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTest.warn(testObject);
      VestTest.fail(testObject);
      expect(VestTest.statusEquals(testObject, TestStatus.WARNING)).toBe(true);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTest.pass(testObject);
      expect(VestTest.statusEquals(testObject, TestStatus.PASSING)).toBe(true);
    });

    it('Should return false when test status does not equal the provided status', () => {
      VestTest.fail(testObject);
      expect(VestTest.statusEquals(testObject, TestStatus.PASSING)).toBe(false);
    });
  });

  describe('isAsyncTest', () => {
    it('Should return true when test is async', () => {
      testObject.data.asyncTest = new Promise(() => {});
      expect(VestTest.isAsyncTest(testObject)).toBe(true);
    });

    it('Should return false when test is not async', () => {
      expect(VestTest.isAsyncTest(testObject)).toBe(false);
    });
  });
});
