import {
  Maybe,
  invariant,
  isPromise,
  dynamicValue,
  makeResult,
  Result,
} from 'vest-utils';
import {
  IsolateMutator,
  IsolateSelectors,
  TIsolate,
  Walker,
} from 'vestjs-runtime';

import { useUpdateRegistry } from '../../test/TestRegistry';

import { ErrorStrings } from '../../../errors/ErrorStrings';
import { TIsolateGroup } from '../../../isolates/group';
import { TestSeverity } from '../../../suiteResult/Severity';
import { TFieldName, TGroupName } from '../../../suiteResult/SuiteResultTypes';
import {
  IsolateTestStateMachine,
  TestAction,
  TestStatus,
} from '../../StateMachines/IsolateTestStateMachine';
import { VestIsolateType } from '../VestIsolateType';

import type { TIsolateTest } from './IsolateTest';

export class VestTest {
  static stateMachine = IsolateTestStateMachine;

  // Read
  /**
   * Retrieves the data object from the test isolate.
   */
  static getData<F extends TFieldName = TFieldName>(test: TIsolateTest<F>) {
    invariant(test.data);
    return test.data;
  }

  /**
   * Retrieves the current status of the test.
   */
  static getStatus(test: TIsolateTest): TestStatus {
    const data = VestTest.getData(test);
    return data.testStatus;
  }

  /**
   * Sets the status of the test, triggering a state machine transition.
   */
  static setStatus(
    test: TIsolateTest,
    status: TestStatus,
    payload?: any,
  ): void {
    const currentStatus = VestTest.getStatus(test);
    const nextStatus = VestTest.stateMachine.staticTransition(
      currentStatus,
      status,
      payload,
    );

    VestTest.setData(test, current => ({
      ...current,
      testStatus: nextStatus,
    }));

    useUpdateRegistry(test);
  }

  static getGroupName<G extends TGroupName>(test: TIsolateTest): Maybe<G> {
    const group = Walker.closest<TIsolateGroup<G>>(test, i =>
      IsolateSelectors.isIsolateType(i, VestIsolateType.Group),
    );
    return group?.data.groupName;
  }

  /**
   * Checks if the given isolate is a VestTest isolate.
   */
  static is(isolate?: Maybe<TIsolate>): isolate is TIsolateTest {
    return IsolateSelectors.isIsolateType<TIsolateTest>(
      isolate,
      VestIsolateType.Test,
    );
  }

  static cast<F extends TFieldName = TFieldName>(
    isolate?: Maybe<TIsolate>,
  ): Result<TIsolateTest<F>, string> {
    return VestTest.is(isolate)
      ? makeResult.Ok(isolate as TIsolateTest<F>)
      : makeResult.Err(ErrorStrings.EXPECTED_VEST_TEST);
  }

  static statusEquals(test: TIsolateTest, status: TestStatus): boolean {
    return VestTest.getStatus(test) === status;
  }

  static warns(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(
      VestTest.getData(test).severity === TestSeverity.Warning,
    );
  }

  static isSuccessSeverity(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(
      VestTest.getData(test).severity === TestSeverity.Success,
    );
  }

  static isOmitted(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(VestTest.statusEquals(test, TestStatus.OMITTED));
  }

  static isUntested(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(VestTest.statusEquals(test, TestStatus.UNTESTED));
  }

  static isFailing(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(VestTest.statusEquals(test, TestStatus.FAILED));
  }

  static isCanceled(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(VestTest.statusEquals(test, TestStatus.CANCELED));
  }

  static isSkipped(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(VestTest.statusEquals(test, TestStatus.SKIPPED));
  }

  static isPassing(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(VestTest.statusEquals(test, TestStatus.PASSING));
  }

  static isWarning(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(VestTest.statusEquals(test, TestStatus.WARNING));
  }

  /**
   * Checks if the test has failed or has a warning.
   */
  static hasFailures(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(
      VestTest.isFailing(test).unwrap() || VestTest.isWarning(test).unwrap(),
    );
  }

  static isNonActionable(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(
      VestTest.isSkipped(test).unwrap() ||
        VestTest.isOmitted(test).unwrap() ||
        VestTest.isCanceled(test).unwrap(),
    );
  }

  /**
   * Checks if the test has been run and completed (passed or failed).
   */
  static isTested(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(
      VestTest.hasFailures(test).unwrap() || VestTest.isPassing(test).unwrap(),
    );
  }

  static isStartedStatus(test: TIsolateTest): boolean {
    return VestTest.statusEquals(test, TestStatus.STARTED);
  }

  static isStarted(test: TIsolateTest): Result<boolean> {
    return makeResult.Ok(VestTest.isStartedStatus(test));
  }

  /**
   * Checks if the test is awaiting resolution (skipped, untested, or started).
   */
  static awaitsResolution(test: TIsolateTest): Result<boolean> {
    // Is the test in a state where it can still be run, or complete running
    // and its final status is indeterminate?
    return makeResult.Ok(
      VestTest.isSkipped(test).unwrap() ||
        VestTest.isUntested(test).unwrap() ||
        VestTest.isStartedStatus(test),
    );
  }

  /**
   * Checks if the test is asynchronous.
   */
  static isAsyncTest(test: TIsolateTest): boolean {
    return isPromise(VestTest.getData(test).asyncTest);
  }

  // Mutate

  static setStarted(test: TIsolateTest) {
    VestTest.setStatus(test, TestStatus.STARTED);
  }

  static fail(test: TIsolateTest): void {
    VestTest.setStatus(
      test,
      VestTest.warns(test).unwrap() ? TestStatus.WARNING : TestStatus.FAILED,
    );
  }

  static pass(test: TIsolateTest): void {
    VestTest.setStatus(test, TestStatus.PASSING);
  }

  static warn(test: TIsolateTest): void {
    VestTest.setData(test, current => ({
      ...current,
      severity: TestSeverity.Warning,
    }));
  }

  // VestTest.setSeverity intentionally skips useUpdateRegistry; severity is consumed by fail() -> VestTest.setStatus(), which calls useUpdateRegistry and avoids intermediate registry updates.
  static setSeverity(test: TIsolateTest, severity: TestSeverity): void {
    if (VestTest.isTested(test).unwrap()) {
      return;
    }

    VestTest.setData(test, current => ({
      ...current,
      severity,
    }));
  }

  static setData(
    test: TIsolateTest,
    setter:
      | ((current: TIsolateTest['data']) => TIsolateTest['data'])
      | TIsolateTest['data'],
  ): void {
    test.data = dynamicValue(setter, VestTest.getData(test));
  }

  static skip(test: TIsolateTest, force?: boolean): void {
    // Without this force flag, the test will be marked as skipped even if it is pending.
    // This means that it will not be counted in "allIncomplete" and its done callbacks
    // will not be called, or will be called prematurely.
    // What this mostly say is that when we have a pending test for one field, and we then
    // start typing in a different field - the pending test will be canceled, which
    // is usually an unwanted behavior.
    // The only scenario in which we DO want to cancel the async test regardless
    // is when we specifically skip a test with `skipWhen`, which is handled by the
    // "force" boolean flag.
    // I am not a fan of this flag, but it gets the job done.
    VestTest.setStatus(test, TestStatus.SKIPPED, force);
  }

  static cancel(test: TIsolateTest): void {
    VestTest.setStatus(test, TestStatus.CANCELED);
    IsolateMutator.abort(test, TestStatus.CANCELED);
  }

  static omit(test: TIsolateTest): void {
    VestTest.setStatus(test, TestStatus.OMITTED);
  }

  static reset(test: TIsolateTest): void {
    VestTest.setStatus(test, TestAction.RESET);
  }
}
