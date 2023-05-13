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
/* eslint-enable sort-keys */
