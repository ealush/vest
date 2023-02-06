import * as walker from 'walker';

import { IsolateTest } from 'IsolateTest';
import { useAvailableSuiteRoot } from 'PersistedContext';
import { TFieldName } from 'SuiteResultTypes';
import type { Isolate } from 'isolate';
import matchingFieldName from 'matchingFieldName';

class SuiteWalker {
  static walk(
    callback: (isolate: Isolate, breakout: () => void) => void,
    visitOnly?: walker.VisitOnlyPredicate
  ): void {
    const root = useAvailableSuiteRoot();

    if (!root) return;

    walker.walk(root, callback, visitOnly);
  }

  static some(
    predicate: (node: Isolate) => boolean,
    visitOnly?: walker.VisitOnlyPredicate
  ): boolean {
    const root = useAvailableSuiteRoot();

    if (!root) return false;
    return walker.some(root, predicate, visitOnly);
  }

  static has(match: walker.VisitOnlyPredicate): boolean {
    const root = useAvailableSuiteRoot();

    if (!root) return false;
    return walker.has(root, match);
  }

  static find(
    predicate: (node: Isolate) => boolean,
    visitOnly?: walker.VisitOnlyPredicate
  ): Isolate | null {
    const root = useAvailableSuiteRoot();

    if (!root) return null;
    return walker.find(root, predicate, visitOnly);
  }

  static every(
    predicate: (node: Isolate) => boolean,
    visitOnly?: walker.VisitOnlyPredicate
  ): boolean {
    const root = useAvailableSuiteRoot();

    if (!root) return false;
    return walker.every(root, predicate, visitOnly);
  }

  static pluck(
    predicate: (node: Isolate) => boolean,
    visitOnly?: walker.VisitOnlyPredicate
  ): void {
    const root = useAvailableSuiteRoot();

    if (!root) return;
    return walker.pluck(root, predicate, visitOnly);
  }
}

export class TestWalker {
  static hasNoTests(): boolean {
    return !SuiteWalker.has(IsolateTest.is);
  }

  static someIncompleteTests(
    predicate: (test: IsolateTest) => boolean
  ): boolean {
    return SuiteWalker.some(isolate => {
      IsolateTest.isX(isolate);

      return isolate.isPending() && predicate(isolate);
    }, IsolateTest.is);
  }

  static someTests(predicate: (test: IsolateTest) => boolean): boolean {
    return SuiteWalker.some(isolate => {
      IsolateTest.isX(isolate);

      return predicate(isolate);
    }, IsolateTest.is);
  }

  static everyTest(predicate: (test: IsolateTest) => boolean): boolean {
    return SuiteWalker.every(isolate => {
      IsolateTest.isX(isolate);

      return predicate(isolate);
    }, IsolateTest.is);
  }

  static walkTests(
    callback: (test: IsolateTest, breakout: () => void) => void
  ): void {
    SuiteWalker.walk((isolate, breakout) => {
      IsolateTest.isX(isolate);

      callback(isolate, breakout);
    }, IsolateTest.is);
  }

  static hasRemainingTests(fieldName?: TFieldName): boolean {
    return TestWalker.someIncompleteTests(testObject => {
      if (fieldName) {
        return matchingFieldName(testObject, fieldName);
      }
      return true;
    });
  }

  static pluckTests(predicate: (test: IsolateTest) => boolean): void {
    SuiteWalker.pluck(isolate => {
      IsolateTest.isX(isolate);

      return predicate(isolate);
    }, IsolateTest.is);
  }

  static resetField(fieldName: TFieldName): void {
    TestWalker.walkTests(testObject => {
      if (matchingFieldName(testObject, fieldName)) {
        testObject.reset();
      }
    });
  }

  static removeTestByFieldName(fieldName: TFieldName): void {
    TestWalker.pluckTests(testObject => {
      return matchingFieldName(testObject, fieldName);
    });
  }
}
