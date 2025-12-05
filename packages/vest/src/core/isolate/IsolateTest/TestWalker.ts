import { Nullable, makeResult } from 'vest-utils';
import { Walker, VestRuntime, TIsolate } from 'vestjs-runtime';

import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import matchingFieldName from '../../test/helpers/matchingFieldName';

import { TIsolateTest } from './IsolateTest';
import { VestTest } from './VestTest';

type MaybeRoot = Nullable<TIsolate>;

export class TestWalker {
  static defaultRoot = VestRuntime.useAvailableRoot;

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

  static walkTests<F extends TFieldName>(
    callback: (test: TIsolateTest<F>, breakout: () => void) => void,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): void {
    if (!root) return;
    Walker.walk(
      root,
      isolate => {
        let broken = false;
        callback(VestTest.cast<F>(isolate), () => {
          broken = true;
        });
        if (broken) {
          return makeResult.Err(undefined);
        }
        return makeResult.Ok(undefined);
      },
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
      if (matchingFieldName(VestTest.getData(testObject), fieldName).unwrap()) {
        VestTest.reset(testObject);
      }
    }, TestWalker.defaultRoot());
  }

  static removeTestByFieldName(
    fieldName: TFieldName,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): void {
    TestWalker.pluckTests(testObject => {
      return matchingFieldName(
        VestTest.getData(testObject),
        fieldName,
      ).unwrap();
    }, root);
  }
}
