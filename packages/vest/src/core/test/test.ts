import { invariant, makeBrand } from 'vest-utils';
import { IsolateKey } from 'vestjs-runtime';

import { useEmit } from '../VestBus/VestBus';
import { useDependencies } from '../Runtime';
import { ErrorStrings } from '../../errors/ErrorStrings';
import { useHasOnliedTests } from '../../hooks/focused/useHasOnliedTests';
import { include } from '../../hooks/include';
import { IsolateTest } from '../isolate/IsolateTest/IsolateTest';

import { TestReturnValue } from './TestReturnValue';
import { TestFn, TestMessage } from './TestTypes';
import { useAttemptRunTest } from './testLevelFlowControl/runTest';
import { validateTestParams } from './validateTestParams';

function vestTest(
  fieldName: string,
  message: TestMessage,
  cb: TestFn,
): TestReturnValue;
function vestTest(fieldName: string, cb: TestFn): TestReturnValue;
function vestTest(
  fieldName: string,
  message: TestMessage,
  cb: TestFn,
  key: IsolateKey,
): TestReturnValue;
function vestTest(
  fieldName: string,
  cb: TestFn,
  key: IsolateKey,
): TestReturnValue;
// eslint-disable-next-line vest-internal/use-use
function vestTest(
  fieldName: string,
  ...args:
    | [message: TestMessage, cb: TestFn]
    | [cb: TestFn]
    | [message: TestMessage, cb: TestFn, key: IsolateKey]
    | [cb: TestFn, key: IsolateKey]
): TestReturnValue {
  const {
    fieldName: safeFieldName,
    message,
    testFn,
    key,
  } = validateTestParams(fieldName, ...args).unwrap();

  const testObjectInput = { fieldName: safeFieldName, message, testFn };

  // This invalidates the suite cache.
  useEmit('TEST_RUN_STARTED');

  const testNode = IsolateTest(useAttemptRunTest, testObjectInput, key) as TestReturnValue;

  Object.defineProperty(testNode, 'dependsOn', {
    configurable: true,
    enumerable: false,
    value: function(...fields: (TFieldName | string)[]) {
      const [, setDependencies] = useDependencies();

      for (const depField of fields) {
        invariant(depField !== safeFieldName, ErrorStrings.INCLUDE_SELF);

        setDependencies(deps => {
          deps[safeFieldName] = deps[safeFieldName] || [];
          if (!deps[safeFieldName].includes(depField as string)) {
            deps[safeFieldName].push(depField as string);
          }
          return deps;
        });
      }
      return testNode;
    },
    writable: true,
  });

  return testNode;
}

export const test = vestTest;
