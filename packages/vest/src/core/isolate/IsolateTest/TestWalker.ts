import { Nullable, makeResult } from 'vest-utils';
import { Walker, VestRuntime, TIsolate, IsolateMutator } from 'vestjs-runtime';

import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import matchingFieldName from '../../test/helpers/matchingFieldName';

import { TIsolateTest } from './IsolateTest';
import { VestTest } from './VestTest';

type MaybeRoot = Nullable<TIsolate>;

// Watcher key constant - internal to the Test domain
const VEST_TEST_WATCHER_KEY = 'VEST_TESTS';

/**
 * Registers the test watcher. Encapsulates the registration logic so
 * consumers don't need to know the key or predicate.
 * Should be called once during suite initialization.
 */
export function useRegisterTestWatcher(): void {
  VestRuntime.useRegisterIsolateWatcher(VEST_TEST_WATCHER_KEY, VestTest.is);
}

/**
 * Returns an Iterable of all watched tests.
 * Encapsulates access to the watcher key.
 */
export function useWatchedTests<F extends TFieldName>(): Iterable<
  TIsolateTest<F>
> {
  return VestRuntime.useWatchedIsolates(VEST_TEST_WATCHER_KEY) as Iterable<
    TIsolateTest<F>
  >;
}

export class TestWalker {
  static defaultRoot = VestRuntime.useAvailableRoot;

  static someTests(
    predicate: (test: TIsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): boolean {
    if (!root) return false;
    if (root === VestRuntime.useAvailableRoot()) {
      return TestWalker.someTestsUsingWatcher(predicate);
    }
    return Walker.some(
      root,
      isolate => {
        const test = VestTest.cast(isolate).unwrap();

        return predicate(test);
      },
      VestTest.is,
    );
  }

  private static someTestsUsingWatcher(
    predicate: (test: TIsolateTest) => boolean,
  ): boolean {
    const tests = VestRuntime.useWatchedIsolates(VEST_TEST_WATCHER_KEY);
    // Manual iteration for Iterable (no Array.some on Set/Iterable)
    for (const test of tests) {
      if (predicate(test as TIsolateTest)) return true;
    }
    return false;
  }

  static walkTests<F extends TFieldName>(
    callback: (test: TIsolateTest<F>, breakout: () => void) => void,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): void {
    if (!root) return;
    if (root === VestRuntime.useAvailableRoot()) {
      TestWalker.walkTestsUsingWatcher(callback);
      return;
    }

    Walker.walk(
      root,
      isolate => {
        let broken = false;
        callback(VestTest.cast<F>(isolate).unwrap(), () => {
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

  private static walkTestsUsingWatcher<F extends TFieldName>(
    callback: (test: TIsolateTest<F>, breakout: () => void) => void,
  ): void {
    const tests = VestRuntime.useWatchedIsolates(VEST_TEST_WATCHER_KEY);
    for (const test of tests) {
      let broken = false;
      callback(test as TIsolateTest<F>, () => {
        broken = true;
      });
      if (broken) {
        return;
      }
    }
  }

  static pluckTests(
    predicate: (test: TIsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): void {
    if (!root) return;
    if (root === VestRuntime.useAvailableRoot()) {
      TestWalker.pluckTestsUsingWatcher(predicate);
      return;
    }
    Walker.pluck(
      root,
      isolate => {
        const test = VestTest.cast(isolate).unwrap();

        return predicate(test);
      },
      VestTest.is,
    );
  }

  private static pluckTestsUsingWatcher(
    predicate: (test: TIsolateTest) => boolean,
  ): void {
    const tests = VestRuntime.useWatchedIsolates(VEST_TEST_WATCHER_KEY);
    // Use for...of for Iterable compatibility
    for (const test of tests) {
      if (predicate(test as TIsolateTest)) {
        if (test.parent) {
          IsolateMutator.removeChild(test.parent, test);
        }
      }
    }
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
