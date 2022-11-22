import { Isolate, IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import matchingFieldName from 'matchingFieldName';
import * as walker from 'walker';

import { useSuiteRuntimeRoot } from 'SuiteContext';

export class SuiteWalker {
  static walk(
    callback: (isolate: Isolate, breakout: () => void) => void,
    visitOnly?: IsolateTypes
  ): void {
    walker.walk(useSuiteRuntimeRoot(), callback, visitOnly);
  }

  static some(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): boolean {
    return walker.some(useSuiteRuntimeRoot(), predicate, visitOnly);
  }

  static has(match: IsolateTypes): boolean {
    return walker.has(useSuiteRuntimeRoot(), match);
  }

  static find(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): Isolate | null {
    return walker.find(useSuiteRuntimeRoot(), predicate, visitOnly);
  }

  static every(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): boolean {
    return walker.every(useSuiteRuntimeRoot(), predicate, visitOnly);
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

  static hasRemainingTests(fieldName?: string): boolean {
    return TestWalker.someIncompleteTests(testObject => {
      if (fieldName) {
        return matchingFieldName(testObject, fieldName);
      }
      return true;
    });
  }
}
