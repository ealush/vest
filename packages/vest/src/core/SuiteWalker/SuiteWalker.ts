import * as walker from 'walker';

import { Isolate } from 'Isolate';
import { IsolateTypes } from 'IsolateTypes';
import { useAvailableSuiteRoot } from 'PersistedContext';
import { TFieldName } from 'SuiteResultTypes';
import { VestTest } from 'VestTest';
import matchingFieldName from 'matchingFieldName';

export class SuiteWalker {
  static walk(
    callback: (isolate: Isolate, breakout: () => void) => void,
    visitOnly?: IsolateTypes
  ): void {
    const root = useAvailableSuiteRoot();

    if (!root) return;

    walker.walk(root, callback, visitOnly);
  }

  static some(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): boolean {
    const root = useAvailableSuiteRoot();

    if (!root) return false;
    return walker.some(root, predicate, visitOnly);
  }

  static has(match: IsolateTypes): boolean {
    const root = useAvailableSuiteRoot();

    if (!root) return false;
    return walker.has(root, match);
  }

  static find(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): Isolate | null {
    const root = useAvailableSuiteRoot();

    if (!root) return null;
    return walker.find(root, predicate, visitOnly);
  }

  static every(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): boolean {
    const root = useAvailableSuiteRoot();

    if (!root) return false;
    return walker.every(root, predicate, visitOnly);
  }

  static pluck(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): void {
    const root = useAvailableSuiteRoot();

    if (!root) return;
    return walker.pluck(root, predicate, visitOnly);
  }
}

export class TestWalker {
  static hasNoTests(): boolean {
    return !SuiteWalker.has(IsolateTypes.TEST);
  }

  static someIncompleteTests(predicate: (test: VestTest) => boolean): boolean {
    return SuiteWalker.some(isolate => {
      const testObject = isolate.data as VestTest;

      return testObject.isPending() && predicate(testObject);
    }, IsolateTypes.TEST);
  }

  static someTests(predicate: (test: VestTest) => boolean): boolean {
    return SuiteWalker.some(isolate => {
      const testObject = isolate.data as VestTest;

      return predicate(testObject);
    }, IsolateTypes.TEST);
  }

  static everyTest(predicate: (test: VestTest) => boolean): boolean {
    return SuiteWalker.every(isolate => {
      const testObject = isolate.data as VestTest;

      return predicate(testObject);
    }, IsolateTypes.TEST);
  }

  static walkTests(
    callback: (test: VestTest, breakout: () => void) => void
  ): void {
    SuiteWalker.walk((isolate, breakout) => {
      const testObject = isolate.data as VestTest;

      callback(testObject, breakout);
    }, IsolateTypes.TEST);
  }

  static hasRemainingTests(fieldName?: TFieldName): boolean {
    return TestWalker.someIncompleteTests(testObject => {
      if (fieldName) {
        return matchingFieldName(testObject, fieldName);
      }
      return true;
    });
  }

  static pluckTests(predicate: (test: VestTest) => boolean): void {
    SuiteWalker.pluck(isolate => {
      const testObject = isolate.data as VestTest;

      return predicate(testObject);
    }, IsolateTypes.TEST);
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
