import { invariant, isPromise } from 'vest-utils';

import type { TIsolateTest } from 'IsolateTest';
import { TestStatus } from 'IsolateTestStateMachine';
import { TestSeverity } from 'Severity';
import { TFieldName, TGroupName } from 'SuiteResultTypes';

export class VestTestInspector {
  static getData<
    F extends TFieldName = TFieldName,
    G extends TGroupName = TGroupName
  >(test: TIsolateTest<F, G>) {
    invariant(test.data);
    return test.data;
  }

  static warns(test: TIsolateTest): boolean {
    return VestTestInspector.getData(test).severity === TestSeverity.Warning;
  }

  static isPending(test: TIsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.PENDING);
  }

  static isOmitted(test: TIsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.OMITTED);
  }

  static isUntested(test: TIsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.UNTESTED);
  }

  static isFailing(test: TIsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.FAILED);
  }

  static isCanceled(test: TIsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.CANCELED);
  }

  static isSkipped(test: TIsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.SKIPPED);
  }

  static isPassing(test: TIsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.PASSING);
  }

  static isWarning(test: TIsolateTest): boolean {
    return VestTestInspector.statusEquals(test, TestStatus.WARNING);
  }

  static hasFailures(test: TIsolateTest): boolean {
    return (
      VestTestInspector.isFailing(test) || VestTestInspector.isWarning(test)
    );
  }

  static isNonActionable(test: TIsolateTest): boolean {
    return (
      VestTestInspector.isSkipped(test) ||
      VestTestInspector.isOmitted(test) ||
      VestTestInspector.isCanceled(test)
    );
  }

  static isTested(test: TIsolateTest): boolean {
    return (
      VestTestInspector.hasFailures(test) || VestTestInspector.isPassing(test)
    );
  }

  static awaitsResolution(test: TIsolateTest): boolean {
    // Is the test in a state where it can still be run, or complete running
    // and its final status is indeterminate?
    return (
      VestTestInspector.isSkipped(test) ||
      VestTestInspector.isUntested(test) ||
      VestTestInspector.isPending(test)
    );
  }

  static isAsyncTest(test: TIsolateTest): boolean {
    return isPromise(VestTestInspector.getData(test).asyncTest);
  }

  static statusEquals(test: TIsolateTest, status: TestStatus): boolean {
    return VestTestInspector.getData(test).status === status;
  }
}
