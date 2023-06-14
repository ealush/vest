import { Nullable } from 'vest-utils';
import { Walker, VestRuntime, Isolate } from 'vestjs-runtime';

import { IsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestTestInspector } from 'VestTestInspector';
import { VestTestMutator } from 'VestTestMutator';
import { castIsolateTest, isIsolateTest, isIsolateTestX } from 'isIsolateTest';
import matchingFieldName from 'matchingFieldName';

type MaybeRoot = Nullable<Isolate>;

export class TestWalker {
  static defaultRoot = VestRuntime.useAvailableRoot;

  static hasNoTests(root: MaybeRoot = TestWalker.defaultRoot()): boolean {
    if (!root) return true;
    return !Walker.has(root, isIsolateTest);
  }

  static someIncompleteTests(
    predicate: (test: IsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): boolean {
    if (!root) return false;
    return Walker.some(
      root,
      isolate => {
        isIsolateTestX(isolate);

        return VestTestInspector.isPending(isolate) && predicate(isolate);
      },
      isIsolateTest
    );
  }

  static someTests(
    predicate: (test: IsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): boolean {
    if (!root) return false;
    return Walker.some(
      root,
      isolate => {
        isIsolateTestX(isolate);

        return predicate(isolate);
      },
      isIsolateTest
    );
  }

  static everyTest(
    predicate: (test: IsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): boolean {
    if (!root) return false;
    return Walker.every(
      root,
      isolate => {
        isIsolateTestX(isolate);

        return predicate(isolate);
      },
      isIsolateTest
    );
  }

  static walkTests<F extends TFieldName, G extends TGroupName>(
    callback: (test: IsolateTest<F, G>, breakout: () => void) => void,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): void {
    if (!root) return;
    Walker.walk(
      root,
      (isolate, breakout) => {
        callback(castIsolateTest(isolate), breakout);
      },
      isIsolateTest
    );
  }

  static hasRemainingTests(fieldName?: TFieldName): boolean {
    return TestWalker.someIncompleteTests(testObject => {
      if (fieldName) {
        return matchingFieldName(testObject, fieldName);
      }
      return true;
    });
  }

  static pluckTests(
    predicate: (test: IsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): void {
    if (!root) return;
    Walker.pluck(
      root,
      isolate => {
        isIsolateTestX(isolate);

        return predicate(isolate);
      },
      isIsolateTest
    );
  }

  static resetField(fieldName: TFieldName): void {
    TestWalker.walkTests(testObject => {
      if (matchingFieldName(testObject, fieldName)) {
        VestTestMutator.reset(testObject);
      }
    }, TestWalker.defaultRoot());
  }

  static removeTestByFieldName(
    fieldName: TFieldName,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): void {
    TestWalker.pluckTests(testObject => {
      return matchingFieldName(testObject, fieldName);
    }, root);
  }
}
