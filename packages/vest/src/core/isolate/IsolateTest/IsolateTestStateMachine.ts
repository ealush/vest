import { StateMachine, TStateMachine } from 'SimpleStateMachine';

export enum TestStatus {
  UNTESTED = 'UNTESTED',
  SKIPPED = 'SKIPPED',
  FAILED = 'FAILED',
  WARNING = 'WARNING',
  PASSING = 'PASSING',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  OMITTED = 'OMITTED',
}

export enum TestAction {
  RESET = 'RESET',
}

type TAction = TestAction | TestStatus;

export function createTestStateMachine() {
  return StateMachine<TestStatus, TAction>(machine);
}

/* eslint-disable sort-keys */
const machine: TStateMachine<TestStatus, TAction> = {
  initial: TestStatus.UNTESTED,
  states: {
    [TestStatus.UNTESTED]: {
      [TestStatus.CANCELED]: TestStatus.CANCELED,
      [TestStatus.FAILED]: TestStatus.FAILED,
      [TestStatus.OMITTED]: TestStatus.OMITTED,
      [TestStatus.PASSING]: TestStatus.PASSING,
      [TestStatus.PENDING]: TestStatus.PENDING,
      [TestStatus.SKIPPED]: TestStatus.SKIPPED,
      [TestStatus.WARNING]: TestStatus.WARNING,
    },
    [TestStatus.SKIPPED]: {
      [TestAction.RESET]: TestStatus.UNTESTED,
    },
    [TestStatus.FAILED]: {
      [TestAction.RESET]: TestStatus.UNTESTED,
      [TestStatus.OMITTED]: TestStatus.OMITTED,
    },
    [TestStatus.WARNING]: {
      [TestAction.RESET]: TestStatus.UNTESTED,
    },
    [TestStatus.PASSING]: {
      [TestAction.RESET]: TestStatus.UNTESTED,
    },
    [TestStatus.PENDING]: {
      [TestAction.RESET]: TestStatus.UNTESTED,
      [TestStatus.CANCELED]: TestStatus.CANCELED,
      [TestStatus.FAILED]: TestStatus.FAILED,
      [TestStatus.OMITTED]: TestStatus.OMITTED,
      [TestStatus.PASSING]: TestStatus.PASSING,
      [TestStatus.SKIPPED]: [
        TestStatus.SKIPPED,
        (force?: boolean) => force === true,
      ],
      [TestStatus.WARNING]: TestStatus.WARNING,
    },
    [TestStatus.CANCELED]: {
      [TestAction.RESET]: TestStatus.UNTESTED,
    },
    [TestStatus.OMITTED]: {
      [TestAction.RESET]: TestStatus.UNTESTED,
    },
  },
};
/* eslint-enable sort-keys */
