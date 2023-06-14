import { isPromise } from 'vest-utils';

import type { IsolateTest } from 'IsolateTest';
import { TestStatus } from 'IsolateTestStateMachine';
import { TestSeverity } from 'Severity';

export class VestTestInspector {
  static warns(test: IsolateTest): boolean {
    return test.severity === TestSeverity.Warning;
  }

  static isPending(test: IsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.PENDING);
  }

  static isOmitted(test: IsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.OMITTED);
  }

  static isUntested(test: IsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.UNTESTED);
  }

  static isFailing(test: IsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.FAILED);
  }

  static isCanceled(test: IsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.CANCELED);
  }

  static isSkipped(test: IsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.SKIPPED);
  }

  static isPassing(test: IsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.PASSING);
  }

  static isWarning(test: IsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.WARNING);
  }

  static hasFailures(test: IsolateTest): boolean {
    return (
      VestTestInspector.isFailing(test) || VestTestInspector.isWarning(test)
    );
  }

  static isNonActionable(test: IsolateTest): boolean {
    return (
      VestTestInspector.isSkipped(test) ||
      VestTestInspector.isOmitted(test) ||
      VestTestInspector.isCanceled(test)
    );
  }

  static isTested(test: IsolateTest): boolean {
    return (
      VestTestInspector.hasFailures(test) || VestTestInspector.isPassing(test)
    );
  }

  static awaitsResolution(test: IsolateTest): boolean {
    // Is the test in a state where it can still be run, or complete running
    // and its final status is indeterminate?
    return (
      VestTestInspector.isSkipped(test) ||
      VestTestInspector.isUntested(test) ||
      VestTestInspector.isPending(test)
    );
  }

  static isAsyncTest(test: IsolateTest): boolean {
    return isPromise(test.asyncTest);
  }

  static statusEquals(test: IsolateTest, status: TestStatus): boolean {
    return test.stateMachine.getState() === status;
  }
}
