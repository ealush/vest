import { Nullable } from 'vest-utils';
import { Walker, VestRuntime, TIsolate } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestTest, VestTest } from 'VestTest';
import { castIsolateTest, isIsolateTest, isIsolateTestX } from 'isIsolateTest';
import matchingFieldName from 'matchingFieldName';

type MaybeRoot = Nullable<TIsolate>;

export class TestWalker {
  static defaultRoot = VestRuntime.useAvailableRoot;

  static hasNoTests(root: MaybeRoot = TestWalker.defaultRoot()): boolean {
    if (!root) return true;
    return !Walker.has(root, isIsolateTest);
  }

  static someIncompleteTests(
    predicate: (test: TIsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): boolean {
    if (!root) return false;
    return Walker.some(
      root,
      isolate => {
        isIsolateTestX(isolate);

        return VestTest.isPending(isolate) && predicate(isolate);
      },
      isIsolateTest
    );
  }

  static someTests(
    predicate: (test: TIsolateTest) => boolean,
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
    predicate: (test: TIsolateTest) => boolean,
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
    callback: (test: TIsolateTest<F, G>, breakout: () => void) => void,
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
        return matchingFieldName(VestTest.getData(testObject), fieldName);
      }
      return true;
    });
  }

  static pluckTests(
    predicate: (test: TIsolateTest) => boolean,
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
      if (matchingFieldName(VestTest.getData(testObject), fieldName)) {
        VestTest.reset(testObject);
      }
    }, TestWalker.defaultRoot());
  }

  static removeTestByFieldName(
    fieldName: TFieldName,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): void {
    TestWalker.pluckTests(testObject => {
      return matchingFieldName(VestTest.getData(testObject), fieldName);
    }, root);
  }
}
