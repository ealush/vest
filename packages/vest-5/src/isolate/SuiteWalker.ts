import { VestTest } from 'VestTest';
import { SuiteRuntimeRootContext } from 'ctx';
import * as walker from 'walker';

import { Isolate, IsolateTypes } from 'isolateTypes';

export class SuiteWalker {
  static walk(
    callback: (isolate: Isolate, breakout: () => void) => void,
    visitOnly?: IsolateTypes
  ): void {
    walker.walk(SuiteRuntimeRootContext.useX(), callback, visitOnly);
  }

  static some(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): boolean {
    return walker.some(SuiteRuntimeRootContext.useX(), predicate, visitOnly);
  }

  static has(match: IsolateTypes): boolean {
    return walker.has(SuiteRuntimeRootContext.useX(), match);
  }

  static find(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): Isolate | null {
    return walker.find(SuiteRuntimeRootContext.useX(), predicate, visitOnly);
  }

  static every(
    predicate: (node: Isolate) => boolean,
    visitOnly?: IsolateTypes
  ): boolean {
    return walker.every(SuiteRuntimeRootContext.useX(), predicate, visitOnly);
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
}
