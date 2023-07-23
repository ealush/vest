import { TIsolateTest } from 'IsolateTest';
import { TestStatus } from 'IsolateTestStateMachine';
import { VestTestInspector } from 'VestTestInspector';
import { VestTestMutator } from 'VestTestMutator';
import { mockIsolateTest } from 'vestMocks';

describe('VestTestInspector', () => {
  let testObject: TIsolateTest;

  beforeEach(() => {
    testObject = mockIsolateTest({
      fieldName: 'field_name',
    });
  });
  describe('warns', () => {
    it('Should return true when test severity is WARNING', () => {
      VestTestMutator.warn(testObject);

      expect(VestTestInspector.warns(testObject)).toBe(true);
    });

    it('Should return false when test is not warning', () => {
      expect(VestTestInspector.warns(testObject)).toBe(false);
    });
  });

  describe('isPending', () => {
    it('Should return true when test status is PENDING', () => {
      VestTestMutator.setPending(testObject);
      expect(VestTestInspector.isPending(testObject)).toBe(true);
    });

    it('Should return false when test is not pending', () => {
      expect(VestTestInspector.isPending(testObject)).toBe(false);
    });
  });

  describe('isOmitted', () => {
    it('Should return true when test status is OMITTED', () => {
      VestTestMutator.omit(testObject);
      expect(VestTestInspector.isOmitted(testObject)).toBe(true);
    });

    it('Should return false when test is not omitted', () => {
      expect(VestTestInspector.isOmitted(testObject)).toBe(false);
    });
  });

  describe('isUntested', () => {
    it('Should return true when test status is UNTESTED', () => {
      expect(VestTestInspector.isUntested(testObject)).toBe(true);
    });

    it('Should return false when test is not untested', () => {
      VestTestMutator.setPending(testObject);
      expect(VestTestInspector.isUntested(testObject)).toBe(false);
      VestTestMutator.skip(testObject);
      expect(VestTestInspector.isUntested(testObject)).toBe(false);
      VestTestMutator.omit(testObject);
      expect(VestTestInspector.isUntested(testObject)).toBe(false);
    });
  });

  describe('isFailing', () => {
    it('Should return true when test status is FAIL', () => {
      VestTestMutator.fail(testObject);
      expect(VestTestInspector.isFailing(testObject)).toBe(true);
    });

    it('Should return false when test is not failing', () => {
      expect(VestTestInspector.isFailing(testObject)).toBe(false);
    });
  });

  describe('isCanceled', () => {
    it('Should return true when test status is CANCELED', () => {
      VestTestMutator.cancel(testObject);
      expect(VestTestInspector.isCanceled(testObject)).toBe(true);
    });

    it('Should return false when test is not canceled', () => {
      expect(VestTestInspector.isCanceled(testObject)).toBe(false);
    });
  });

  describe('isSkipped', () => {
    it('Should return true when test status is SKIP', () => {
      VestTestMutator.skip(testObject);
      expect(VestTestInspector.isSkipped(testObject)).toBe(true);
    });

    it('Should return false when test is not skipped', () => {
      expect(VestTestInspector.isSkipped(testObject)).toBe(false);
    });
  });

  describe('isPassing', () => {
    it('Should return true when test status is PASS', () => {
      VestTestMutator.pass(testObject);
      expect(VestTestInspector.isPassing(testObject)).toBe(true);
    });

    it('Should return false when test is not passing', () => {
      expect(VestTestInspector.isPassing(testObject)).toBe(false);
    });
  });

  describe('isWarning', () => {
    it('Should return true when test severity is WARNING and the test is failing', () => {
      VestTestMutator.warn(testObject);
      VestTestMutator.fail(testObject);
      expect(VestTestInspector.isWarning(testObject)).toBe(true);
    });

    it('Should return false when test is not actively warning', () => {
      VestTestMutator.warn(testObject);
      expect(VestTestInspector.isWarning(testObject)).toBe(false);
    });
  });

  describe('hasFailures', () => {
    it('Should return true when test has Error failures', () => {
      VestTestMutator.fail(testObject);
      expect(VestTestInspector.hasFailures(testObject)).toBe(true);
    });

    it('Should return true when test has Warning failures', () => {
      VestTestMutator.warn(testObject);
      VestTestMutator.fail(testObject);
      expect(VestTestInspector.hasFailures(testObject)).toBe(true);
    });

    it('Should return false when test has no failures', () => {
      expect(VestTestInspector.hasFailures(testObject)).toBe(false);
    });
  });

  describe('isNonActionable', () => {
    it('Should return true when the test is skipped', () => {
      VestTestMutator.skip(testObject);
      expect(VestTestInspector.isNonActionable(testObject)).toBe(true);
    });

    it('Should return true when the test is omitted', () => {
      VestTestMutator.omit(testObject);
      expect(VestTestInspector.isNonActionable(testObject)).toBe(true);
    });

    it('Should return true when the test is canceled', () => {
      VestTestMutator.cancel(testObject);
      expect(VestTestInspector.isNonActionable(testObject)).toBe(true);
    });

    it('Should return false when the test is not non-actionable', () => {
      expect(VestTestInspector.isNonActionable(testObject)).toBe(false);
      VestTestMutator.setPending(testObject);
      expect(VestTestInspector.isNonActionable(testObject)).toBe(false);
      VestTestMutator.fail(testObject);
      expect(VestTestInspector.isNonActionable(testObject)).toBe(false);
    });
  });

  describe('isTested', () => {
    it('Should return true when the test has done testing', () => {
      VestTestMutator.fail(testObject);
      expect(VestTestInspector.isTested(testObject)).toBe(true);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTestMutator.warn(testObject);
      VestTestMutator.fail(testObject);
      expect(VestTestInspector.isTested(testObject)).toBe(true);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTestMutator.pass(testObject);

      expect(VestTestInspector.isTested(testObject)).toBe(true);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTestMutator.warn(testObject);
      VestTestMutator.pass(testObject);
      expect(VestTestInspector.isTested(testObject)).toBe(true);
    });

    it('Should return false when the test is untested', () => {
      expect(VestTestInspector.isTested(testObject)).toBe(false);
      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTestMutator.omit(testObject);
      expect(VestTestInspector.isTested(testObject)).toBe(false);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTestMutator.skip(testObject);
      expect(VestTestInspector.isTested(testObject)).toBe(false);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTestMutator.setPending(testObject);
      expect(VestTestInspector.isTested(testObject)).toBe(false);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTestMutator.cancel(testObject);
      expect(VestTestInspector.isTested(testObject)).toBe(false);
    });
  });

  describe('awaitsResolution', () => {
    it('Should return true for a skipped test', () => {
      VestTestMutator.skip(testObject);
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(true);
    });

    it('Should return true for an untetsted test', () => {
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(true);
      testObject = mockIsolateTest({ fieldName: 'f' });
    });

    it('Should return true for a pending test', () => {
      VestTestMutator.setPending(testObject);
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(true);
    });

    it('Should retrun false for a tested test', () => {
      VestTestMutator.fail(testObject);
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(false);
      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTestMutator.pass(testObject);
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(false);
    });

    it('Should return false for a canceled test', () => {
      VestTestMutator.cancel(testObject);
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(false);
    });

    it('Should return false for an omitted test', () => {
      VestTestMutator.omit(testObject);
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(false);
    });
  });

  describe('statusEquals', () => {
    it('Should return true when test status equals the provided status', () => {
      VestTestMutator.fail(testObject);
      expect(
        VestTestInspector.statusEquals(testObject, TestStatus.FAILED)
      ).toBe(true);
      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTestMutator.warn(testObject);
      VestTestMutator.fail(testObject);
      expect(
        VestTestInspector.statusEquals(testObject, TestStatus.WARNING)
      ).toBe(true);

      testObject = mockIsolateTest({ fieldName: 'f' });
      VestTestMutator.pass(testObject);
      expect(
        VestTestInspector.statusEquals(testObject, TestStatus.PASSING)
      ).toBe(true);
    });

    it('Should return false when test status does not equal the provided status', () => {
      VestTestMutator.fail(testObject);
      expect(
        VestTestInspector.statusEquals(testObject, TestStatus.PASSING)
      ).toBe(false);
    });
  });

  describe('isAsyncTest', () => {
    it('Should return true when test is async', () => {
      testObject.data.asyncTest = new Promise(() => {});
      expect(VestTestInspector.isAsyncTest(testObject)).toBe(true);
    });

    it('Should return false when test is not async', () => {
      expect(VestTestInspector.isAsyncTest(testObject)).toBe(false);
    });
  });
});
