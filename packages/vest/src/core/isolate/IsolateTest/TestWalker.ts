import { Nullable } from 'vest-utils';
import { Walker, VestRuntime, TIsolate } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestTest } from 'VestTest';
import matchingFieldName from 'matchingFieldName';

type MaybeRoot = Nullable<TIsolate>;

export class TestWalker {
  static defaultRoot = VestRuntime.useAvailableRoot;

  static hasNoTests(root: MaybeRoot = TestWalker.defaultRoot()): boolean {
    if (!root) return true;
    return !Walker.has(root, VestTest.is);
  }

  static someTests(
    predicate: (test: TIsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): boolean {
    if (!root) return false;
    return Walker.some(
      root,
      isolate => {
        VestTest.isX(isolate);

        return predicate(isolate);
      },
      VestTest.is
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
        VestTest.isX(isolate);

        return predicate(isolate);
      },
      VestTest.is
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
        callback(VestTest.cast<F, G>(isolate), breakout);
      },
      VestTest.is
    );
  }

  static pluckTests(
    predicate: (test: TIsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): void {
    if (!root) return;
    Walker.pluck(
      root,
      isolate => {
        VestTest.isX(isolate);

        return predicate(isolate);
      },
      VestTest.is
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
