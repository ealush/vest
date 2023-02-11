import { IsolateTest } from 'IsolateTest';
import { TFieldName } from 'SuiteResultTypes';
import { SuiteWalker } from 'SuiteWalker';
import matchingFieldName from 'matchingFieldName';

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
