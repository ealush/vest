import { StateMachine, TStateMachine, ValueOf } from 'vest-utils';

import { CommonStates } from 'CommonStateMachine';

export const TestStatus = {
  [CommonStates.PENDING]: CommonStates.PENDING,
  CANCELED: 'CANCELED',
  FAILED: 'FAILED',
  OMITTED: 'OMITTED',
  PASSING: 'PASSING',
  SKIPPED: 'SKIPPED',
  UNTESTED: 'UNTESTED',
  WARNING: 'WARNING',
};

export const TestAction = {
  RESET: 'RESET',
};

export type TestStatus = ValueOf<typeof TestStatus>;
export type TestAction = ValueOf<typeof TestAction>;

export type TestStateMachineAction = TestAction | TestStatus;

const machine: TStateMachine<TestStatus, TestStateMachineAction> = {
  initial: TestStatus.UNTESTED,
  states: {
    '*': {
      [TestStatus.OMITTED]: TestStatus.OMITTED,
      [TestAction.RESET]: TestStatus.UNTESTED,
    },
    [TestStatus.UNTESTED]: {
      [TestStatus.CANCELED]: TestStatus.CANCELED,
      [TestStatus.FAILED]: TestStatus.FAILED,

      [TestStatus.PASSING]: TestStatus.PASSING,
      [TestStatus.PENDING]: TestStatus.PENDING,
      [TestStatus.SKIPPED]: TestStatus.SKIPPED,
      [TestStatus.WARNING]: TestStatus.WARNING,
    },
    [TestStatus.PENDING]: {
      [TestStatus.CANCELED]: TestStatus.CANCELED,
      [TestStatus.FAILED]: TestStatus.FAILED,

      [TestStatus.PASSING]: TestStatus.PASSING,
      [TestStatus.SKIPPED]: [
        TestStatus.SKIPPED,
        (force?: boolean) => force === true,
      ],
      [TestStatus.WARNING]: TestStatus.WARNING,
    },
    [TestStatus.SKIPPED]: {},
    [TestStatus.FAILED]: {},
    [TestStatus.WARNING]: {},
    [TestStatus.PASSING]: {},
    [TestStatus.CANCELED]: {},
    [TestStatus.OMITTED]: {},
  },
};

export const IsolateTestStateMachine = StateMachine<
  TestStatus,
  TestStateMachineAction
>(machine);
