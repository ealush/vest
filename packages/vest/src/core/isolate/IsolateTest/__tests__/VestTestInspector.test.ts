import { IsolateTest } from 'IsolateTest';
import { TestStatus } from 'IsolateTestStateMachine';
import { TestSeverity } from 'Severity';
import { VestTestInspector } from 'VestTestInspector';

describe('VestTestInspector', () => {
  let testObject: IsolateTest;

  beforeEach(() => {
    testObject = new IsolateTest({
      fieldName: 'field_name',
      testFn: jest.fn(),
    });
  });
  describe('warns', () => {
    it('Should return true when test severity is WARNING', () => {
      testObject.warn();

      expect(VestTestInspector.warns(testObject)).toBe(true);
    });

    it('Should return false when test is not warning', () => {
      expect(VestTestInspector.warns(testObject)).toBe(false);
    });
  });

  describe('isPending', () => {
    it('Should return true when test status is PENDING', () => {
      testObject.setPending();
      expect(VestTestInspector.isPending(testObject)).toBe(true);
    });

    it('Should return false when test is not pending', () => {
      expect(VestTestInspector.isPending(testObject)).toBe(false);
    });
  });

  describe('isOmitted', () => {
    it('Should return true when test status is OMITTED', () => {
      testObject.omit();
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
      testObject.setPending();
      expect(VestTestInspector.isUntested(testObject)).toBe(false);
      testObject.skip();
      expect(VestTestInspector.isUntested(testObject)).toBe(false);
      testObject.omit();
      expect(VestTestInspector.isUntested(testObject)).toBe(false);
    });
  });

  describe('isFailing', () => {
    it('Should return true when test status is FAIL', () => {
      testObject.fail();
      expect(VestTestInspector.isFailing(testObject)).toBe(true);
    });

    it('Should return false when test is not failing', () => {
      expect(VestTestInspector.isFailing(testObject)).toBe(false);
    });
  });

  describe('isCanceled', () => {
    it('Should return true when test status is CANCELED', () => {
      testObject.cancel();
      expect(VestTestInspector.isCanceled(testObject)).toBe(true);
    });

    it('Should return false when test is not canceled', () => {
      expect(VestTestInspector.isCanceled(testObject)).toBe(false);
    });
  });

  describe('isSkipped', () => {
    it('Should return true when test status is SKIP', () => {
      testObject.skip();
      expect(VestTestInspector.isSkipped(testObject)).toBe(true);
    });

    it('Should return false when test is not skipped', () => {
      expect(VestTestInspector.isSkipped(testObject)).toBe(false);
    });
  });

  describe('isPassing', () => {
    it('Should return true when test status is PASS', () => {
      testObject.pass();
      expect(VestTestInspector.isPassing(testObject)).toBe(true);
    });

    it('Should return false when test is not passing', () => {
      expect(VestTestInspector.isPassing(testObject)).toBe(false);
    });
  });

  describe('isWarning', () => {
    it('Should return true when test severity is WARNING and the test is failing', () => {
      testObject.warn();
      testObject.fail();
      expect(VestTestInspector.isWarning(testObject)).toBe(true);
    });

    it('Should return false when test is not actively warning', () => {
      testObject.warn();
      expect(VestTestInspector.isWarning(testObject)).toBe(false);
    });
  });

  describe('hasFailures', () => {
    it('Should return true when test has Error failures', () => {
      testObject.fail();
      expect(VestTestInspector.hasFailures(testObject)).toBe(true);
    });

    it('Should return true when test has Warning failures', () => {
      testObject.warn();
      testObject.fail();
      expect(VestTestInspector.hasFailures(testObject)).toBe(true);
    });

    it('Should return false when test has no failures', () => {
      expect(VestTestInspector.hasFailures(testObject)).toBe(false);
    });
  });

  describe('isNonActionable', () => {
    it('Should return true when the test is skipped', () => {
      testObject.skip();
      expect(VestTestInspector.isNonActionable(testObject)).toBe(true);
    });

    it('Should return true when the test is omitted', () => {
      testObject.omit();
      expect(VestTestInspector.isNonActionable(testObject)).toBe(true);
    });

    it('Should return true when the test is canceled', () => {
      testObject.cancel();
      expect(VestTestInspector.isNonActionable(testObject)).toBe(true);
    });

    it('Should return false when the test is not non-actionable', () => {
      expect(VestTestInspector.isNonActionable(testObject)).toBe(false);
      testObject.setPending();
      expect(VestTestInspector.isNonActionable(testObject)).toBe(false);
      testObject.fail();
      expect(VestTestInspector.isNonActionable(testObject)).toBe(false);
    });
  });

  describe('isTested', () => {
    it('Should return true when the test has done testing', () => {
      testObject.fail();
      expect(VestTestInspector.isTested(testObject)).toBe(true);

      testObject = new IsolateTest({
        fieldName: 'field_name',
        testFn: jest.fn(),
      });
      testObject.warn();
      testObject.fail();
      expect(VestTestInspector.isTested(testObject)).toBe(true);

      testObject = new IsolateTest({
        fieldName: 'field_name',
        testFn: jest.fn(),
      });
      testObject.pass();

      expect(VestTestInspector.isTested(testObject)).toBe(true);

      testObject = new IsolateTest({
        fieldName: 'field_name',
        testFn: jest.fn(),
      });
      testObject.warn();
      testObject.pass();
      expect(VestTestInspector.isTested(testObject)).toBe(true);
    });

    it('Should return false when the test is untested', () => {
      expect(VestTestInspector.isTested(testObject)).toBe(false);
      testObject = new IsolateTest({
        fieldName: 'f',
        testFn: jest.fn(),
      });
      testObject.omit();
      expect(VestTestInspector.isTested(testObject)).toBe(false);

      testObject = new IsolateTest({
        fieldName: 'f',
        testFn: jest.fn(),
      });
      testObject.skip();
      expect(VestTestInspector.isTested(testObject)).toBe(false);

      testObject = new IsolateTest({
        fieldName: 'f',
        testFn: jest.fn(),
      });
      testObject.setPending();
      expect(VestTestInspector.isTested(testObject)).toBe(false);

      testObject = new IsolateTest({
        fieldName: 'f',
        testFn: jest.fn(),
      });
      testObject.cancel();
      expect(VestTestInspector.isTested(testObject)).toBe(false);
    });
  });

  describe('awaitsResolution', () => {
    it('Should return true for a skipped test', () => {
      testObject.skip();
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(true);
    });

    it('Should return true for an untetsted test', () => {
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(true);
      testObject = new IsolateTest({
        fieldName: 'f',
        testFn: jest.fn(),
      });
    });

    it('Should return true for a pending test', () => {
      testObject.setPending();
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(true);
    });

    it('Should retrun false for a tested test', () => {
      testObject.fail();
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(false);
      testObject = new IsolateTest({
        fieldName: 'f',
        testFn: jest.fn(),
      });
      testObject.pass();
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(false);
    });

    it('Should return false for a canceled test', () => {
      testObject.cancel();
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(false);
    });

    it('Should return false for an omitted test', () => {
      testObject.omit();
      expect(VestTestInspector.awaitsResolution(testObject)).toBe(false);
    });
  });

  describe('statusEquals', () => {
    it('Should return true when test status equals the provided status', () => {
      testObject.fail();
      expect(
        VestTestInspector.statusEquals(testObject, TestStatus.FAILED)
      ).toBe(true);
      testObject = new IsolateTest({
        fieldName: 'f',
        testFn: jest.fn(),
      });
      testObject.warn();
      testObject.fail();
      expect(
        VestTestInspector.statusEquals(testObject, TestStatus.WARNING)
      ).toBe(true);

      testObject = new IsolateTest({
        fieldName: 'f',
        testFn: jest.fn(),
      });
      testObject.pass();
      expect(
        VestTestInspector.statusEquals(testObject, TestStatus.PASSING)
      ).toBe(true);
    });

    it('Should return false when test status does not equal the provided status', () => {
      testObject.fail();
      expect(
        VestTestInspector.statusEquals(testObject, TestStatus.PASSING)
      ).toBe(false);
    });
  });

  describe('isAsyncTest', () => {
    it('Should return true when test is async', () => {
      testObject.asyncTest = new Promise(() => {});
      expect(VestTestInspector.isAsyncTest(testObject)).toBe(true);
    });

    it('Should return false when test is not async', () => {
      expect(VestTestInspector.isAsyncTest(testObject)).toBe(false);
    });
  });
});
