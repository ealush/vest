import * as walker from 'walker';

import { IsolateTest } from 'IsolateTest';
import { useAvailableSuiteRoot } from 'PersistedContext';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { Isolate } from 'isolate';
import matchingFieldName from 'matchingFieldName';

type MaybeRoot = Isolate | null;

export class TestWalker {
  static defaultRoot() {
    return useAvailableSuiteRoot();
  }

  static hasNoTests(root: MaybeRoot = TestWalker.defaultRoot()): boolean {
    if (!root) return true;
    return !walker.has(root, IsolateTest.is);
  }

  static someIncompleteTests(
    predicate: (test: IsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): boolean {
    if (!root) return false;
    return walker.some(
      root,
      isolate => {
        IsolateTest.isX(isolate);

        return isolate.isPending() && predicate(isolate);
      },
      IsolateTest.is
    );
  }

  static someTests(
    predicate: (test: IsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): boolean {
    if (!root) return false;
    return walker.some(
      root,
      isolate => {
        IsolateTest.isX(isolate);

        return predicate(isolate);
      },
      IsolateTest.is
    );
  }

  static everyTest(
    predicate: (test: IsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): boolean {
    if (!root) return false;
    return walker.every(
      root,
      isolate => {
        IsolateTest.isX(isolate);

        return predicate(isolate);
      },
      IsolateTest.is
    );
  }

  static walkTests<F extends TFieldName, G extends TGroupName>(
    callback: (test: IsolateTest<F, G>, breakout: () => void) => void,
    root: MaybeRoot = TestWalker.defaultRoot()
  ): void {
    if (!root) return;
    walker.walk(
      root,
      (isolate, breakout) => {
        IsolateTest.isX(isolate);

        callback(isolate as IsolateTest<F, G>, breakout);
      },
      IsolateTest.is
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
    walker.pluck(
      root,
      isolate => {
        IsolateTest.isX(isolate);

        return predicate(isolate);
      },
      IsolateTest.is
    );
  }

  static resetField(fieldName: TFieldName): void {
    TestWalker.walkTests(testObject => {
      if (matchingFieldName(testObject, fieldName)) {
        testObject.reset();
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
