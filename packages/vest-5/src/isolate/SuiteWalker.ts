import { Isolate, IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import matchingFieldName from 'matchingFieldName';
import { invariant } from 'vest-utils';
import * as walker from 'walker';

import { useRuntimeRoot, useHistoryRoot } from 'PersistedContext';

function useAvailableSuiteRoot(): Isolate {
  const root = useRuntimeRoot();

  if (root) {
    return root;
  }

  const [historyRoot] = useHistoryRoot();

  // TODO: Find a way to make this invariant more informative
  invariant(historyRoot, 'No root found');

  return historyRoot;
}

export class SuiteWalker {
  static walk(
    callback: (isolate: Isolate, breakout: () => void) => void,
    visitOnly?: IsolateTypes
  ): void {
    walker.walk(useAvailableSuiteRoot(), callback, visitOnly);
  }

  static some(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): boolean {
    return walker.some(useAvailableSuiteRoot(), predicate, visitOnly);
  }

  static has(match: IsolateTypes): boolean {
    return walker.has(useAvailableSuiteRoot(), match);
  }

  static find(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): Isolate | null {
    return walker.find(useAvailableSuiteRoot(), predicate, visitOnly);
  }

  static every(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): boolean {
    return walker.every(useAvailableSuiteRoot(), predicate, visitOnly);
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
