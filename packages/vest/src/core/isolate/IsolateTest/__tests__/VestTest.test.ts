import { describe, it, expect } from 'vitest';
import { getAbortController } from '../../../test/Abortable';
import { VestTest } from '../VestTest';
import {
  TestStatus,
  TestAction,
} from '../../../StateMachines/IsolateTestStateMachine';
import { mockIsolateTest } from '../../../../testUtils/vestMocks';

const statuses = [
  'CANCELED',
  'FAILED',
  'OMITTED',
  'PASSING',
  'SKIPPED',
  'STARTED',
  'UNTESTED',
  'WARNING',
];

describe('VestTest', () => {
  describe('TestStatus', () => {
    it('Should only have supported statuses', () => {
      expect(Object.keys(TestStatus)).toEqual(statuses);
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
  describe('State Machine Transitions', () => {
    describe('From UNTESTED', () => {
      it.each([
        [TestStatus.CANCELED, TestStatus.CANCELED],
        [TestStatus.FAILED, TestStatus.FAILED],
        [TestStatus.PASSING, TestStatus.PASSING],
        [TestStatus.STARTED, TestStatus.STARTED],
        [TestStatus.SKIPPED, TestStatus.SKIPPED],
        [TestStatus.WARNING, TestStatus.WARNING],
        [TestStatus.OMITTED, TestStatus.OMITTED],
        [TestAction.RESET, TestStatus.UNTESTED],
      ])('Should transition to %s', (action, expected) => {
        expect(
          VestTest.stateMachine.staticTransition(TestStatus.UNTESTED, action),
        ).toBe(expected);
      });
    });

    describe('From STARTED', () => {
      it.each([
        [TestStatus.CANCELED, TestStatus.CANCELED],
        [TestStatus.FAILED, TestStatus.FAILED],
        [TestStatus.PASSING, TestStatus.PASSING],
        [TestStatus.WARNING, TestStatus.WARNING],
        [TestStatus.OMITTED, TestStatus.OMITTED],
        [TestAction.RESET, TestStatus.UNTESTED],
      ])('Should transition to %s', (action, expected) => {
        expect(
          VestTest.stateMachine.staticTransition(TestStatus.STARTED, action),
        ).toBe(expected);
      });

      it('Should transition to SKIPPED when forced', () => {
        expect(
          VestTest.stateMachine.staticTransition(
            TestStatus.STARTED,
            TestStatus.SKIPPED,
            true,
          ),
        ).toBe(TestStatus.SKIPPED);
      });

      it('Should NOT transition to SKIPPED when NOT forced', () => {
        expect(
          VestTest.stateMachine.staticTransition(
            TestStatus.STARTED,
            TestStatus.SKIPPED,
            false,
          ),
        ).toBe(TestStatus.STARTED);
        expect(
          VestTest.stateMachine.staticTransition(
            TestStatus.STARTED,
            TestStatus.SKIPPED,
          ),
        ).toBe(TestStatus.STARTED);
      });
    });

    describe('From Terminal States', () => {
      const terminalStates = [
        TestStatus.SKIPPED,
        TestStatus.FAILED,
        TestStatus.WARNING,
        TestStatus.PASSING,
        TestStatus.CANCELED,
        TestStatus.OMITTED,
      ];

      it.each(terminalStates)(
        'Should allow transition from %s to OMITTED',
        state => {
          expect(
            VestTest.stateMachine.staticTransition(state, TestStatus.OMITTED),
          ).toBe(TestStatus.OMITTED);
        },
      );

      it.each(terminalStates)(
        'Should allow transition from %s to RESET (UNTESTED)',
        state => {
          expect(
            VestTest.stateMachine.staticTransition(state, TestAction.RESET),
          ).toBe(TestStatus.UNTESTED);
        },
      );

      it.each(terminalStates)(
        'Should NOT allow transition from %s to other states',
        state => {
          const otherStates = [
            TestStatus.CANCELED,
            TestStatus.FAILED,
            TestStatus.PASSING,
            TestStatus.STARTED,
            TestStatus.SKIPPED,
            TestStatus.WARNING,
          ].filter(s => s !== state);

          otherStates.forEach(target => {
            expect(VestTest.stateMachine.staticTransition(state, target)).toBe(
              state,
            );
          });
        },
      );
    });
  });

  describe('getAbortController', () => {
    it('Should create a new AbortController if one does not exist', () => {
      const testObject = mockIsolateTest();
      expect(testObject.abortController).toBeNull();
      const controller = getAbortController(testObject);
      expect(controller).toBeInstanceOf(AbortController);
      expect(testObject.abortController).toBe(controller);
    });

    it('Should return the existing AbortController if it exists', () => {
      const testObject = mockIsolateTest();
      const controller = new AbortController();
      testObject.abortController = controller;
      expect(getAbortController(testObject)).toBe(controller);
    });
  });
});
