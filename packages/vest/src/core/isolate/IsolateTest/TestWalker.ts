import { Nullable, makeResult } from 'vest-utils';
import { Walker, VestRuntime, TIsolate, IsolateMutator } from 'vestjs-runtime';

import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import matchingFieldName from '../../test/helpers/matchingFieldName';

import { TIsolateTest } from './IsolateTest';
import { VestTest } from './VestTest';

import { useTestObjects } from '../registerTests';

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
        const test = VestTest.cast(isolate).unwrap();

        return predicate(test);
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

  static pluckTests(
    predicate: (test: TIsolateTest) => boolean,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): void {
    if (!root) return;
    Walker.pluck(
      root,
      isolate => {
        const test = VestTest.cast(isolate).unwrap();

        return predicate(test);
      },
      VestTest.is,
    );
  }

  static resetField(fieldName: TFieldName): void {
    useForgetSchemaField(fieldName, TestWalker.defaultRoot());
    TestWalker.walkTests(testObject => {
      if (matchingFieldName(VestTest.getData(testObject), fieldName).unwrap()) {
        if (VestTest.isCanceled(testObject).unwrap()) return;
        if (VestTest.isStartedStatus(testObject)) {
          // A pending async test keeps a live completion that would resurrect
          // the field after the reset. Canceling invalidates its authority to
          // update state: the late settlement becomes a terminal no-op. The
          // underlying work is not stopped; only its state updates are void.
          VestTest.cancel(testObject);
        } else {
          VestTest.reset(testObject);
        }
      }
    }, TestWalker.defaultRoot());
  }

  static removeTestByFieldName(
    fieldName: TFieldName,
    root: MaybeRoot = TestWalker.defaultRoot(),
  ): void {
    useForgetSchemaField(fieldName, root);
    TestWalker.pluckTests(testObject => {
      return matchingFieldName(
        VestTest.getData(testObject),
        fieldName,
      ).unwrap();
    }, root);

    const [, setTests] = useTestObjects();

    setTests(tests =>
      tests.filter((testObject: TIsolateTest) => {
        return (
          !VestTest.is(testObject) ||
          !matchingFieldName(VestTest.getData(testObject), fieldName).unwrap()
        );
      }),
    );
  }
}

/**
 * Clear a literal field's verdict, or every schema key covering a nested path.
 * Exact keys take precedence so a literal dotted key keeps its ancestors intact.
 */
function useForgetSchemaField(fieldName: TFieldName, root: MaybeRoot): void {
  if (!root) return;
  const fields: Record<string, boolean> | undefined = root.data.schemaFields;
  if (!fields) return;

  const keys = Object.keys(fields);
  const targets = keys.includes(fieldName)
    ? [fieldName]
    : keys.filter(key => fieldName.startsWith(`${key}.`));
  if (targets.length === 0) return;

  const schemaFields = { ...fields };
  targets.forEach(field => {
    schemaFields[field] = false;
  });
  IsolateMutator.setData(root, { ...root.data, schemaFields });
}
