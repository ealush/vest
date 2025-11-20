import { Nullable } from 'vest-utils';
import { Walker, VestRuntime, TIsolate } from 'vestjs-runtime';

import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import matchingFieldName from '../../test/helpers/matchingFieldName';

import { TIsolateTest } from './IsolateTest';
import { VestTest } from './VestTest';


type MaybeRoot = Nullable<TIsolate>;

export class TestWalker {
  static defaultRoot = VestRuntime.useAvailableRoot;

  static hasNoTests(root: MaybeRoot = TestWalker.defaultRoot()): boolean {
    if (!root) return true;
    return !Walker.has(root, VestTest.is);
  }

  static someTests(
    predicate: (test: TIsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): boolean {
    if (!root) return false;
    return Walker.some(
      root,
      isolate => {
        VestTest.isX(isolate);

        return predicate(isolate);
      },
      VestTest.is,
    );
  }

  static everyTest(
    predicate: (test: TIsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): boolean {
    if (!root) return false;
    return Walker.every(
      root,
      isolate => {
        VestTest.isX(isolate);

        return predicate(isolate);
      },
      VestTest.is,
    );
  }

  static walkTests<F extends TFieldName>(
    callback: (test: TIsolateTest<F>, breakout: () => void) => void,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): void {
    if (!root) return;
    Walker.walk(
      root,
      (isolate, breakout) => {
        callback(VestTest.cast<F>(isolate), breakout);
      },
      VestTest.is,
    );
  }

  static reduceTests<T, I extends TIsolateTest = TIsolateTest>(
    callback: (acc: T, test: I, breakout: () => void) => T,
    initialValue: T,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): T {
    if (!root) return initialValue;
    return Walker.reduce(
      root,
      (acc, isolate, breakout) => {
        return callback(acc, VestTest.cast(isolate) as I, breakout);
      },
      initialValue,
      VestTest.is,
    );
  }

  static pluckTests(
    predicate: (test: TIsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): void {
    if (!root) return;
    Walker.pluck(
      root,
      isolate => {
        VestTest.isX(isolate);

        return predicate(isolate);
      },
      VestTest.is,
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
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): void {
    TestWalker.pluckTests(testObject => {
      return matchingFieldName(VestTest.getData(testObject), fieldName);
    }, root);
  }
}
