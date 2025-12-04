import { describe, it, expect } from 'vitest';
import { VestTest } from '../VestTest';
import { TestStatus } from '../../../StateMachines/IsolateTestStateMachine';
import { mockIsolateTest } from '../../../../testUtils/vestMocks';

describe('VestTest', () => {
  describe('TestStatus', () => {
    it('Should have STARTED status', () => {
      expect(TestStatus.STARTED).toBe('STARTED');
    });

    it('Should NOT have PENDING status', () => {
      // @ts-expect-error - PENDING should be removed
      expect(TestStatus.PENDING).toBeUndefined();
    });
  });

  describe('VestTest.setStarted', () => {
    it('Should set status to STARTED', () => {
      const testObject = mockIsolateTest();
      VestTest.setStarted(testObject);
      expect(VestTest.getData(testObject).testStatus).toBe(TestStatus.STARTED);
    });
  });

  describe('VestTest.status', () => {
    it('Should return the test status from the data', () => {
      const testObject = mockIsolateTest();
      expect(VestTest.getData(testObject).testStatus).toBe(TestStatus.UNTESTED);
    });
  });
});
