import { invariant } from 'vest-utils';
import { IsolateKey, VestRuntime } from 'vestjs-runtime';

import { useEmit } from '../VestBus/VestBus';
import { ErrorStrings } from '../../errors/ErrorStrings';
import { include } from '../../hooks/include';
import {
  SuiteDependencies,
  TIsolateSuite,
} from '../isolate/IsolateSuite/IsolateSuite';
import { IsolateTest } from '../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../isolate/IsolateTest/VestTest';
import { isVestIsolate } from '../isolate/VestIsolateType';

import { TFieldName } from '../../suiteResult/SuiteResultTypes';
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

  const testNode = IsolateTest(
    useAttemptRunTest,
    testObjectInput,
    key,
  ) as TestReturnValue;

  Object.defineProperty(testNode, 'dependsOn', {
    configurable: true,
    enumerable: false,
    value: (...fields: TFieldName[]) => {
      fields.forEach(depField => {
        invariant(depField !== safeFieldName, ErrorStrings.INCLUDE_SELF);
        include(safeFieldName).when(depField);
        const testData = VestTest.getData(testNode);
        testData.dependsOn = [...(testData.dependsOn ?? []), depField];

        const root = VestRuntime.useAvailableRoot<TIsolateSuite>();
        if (isVestIsolate(root)) {
          SuiteDependencies.addDependency(root, safeFieldName, depField);
        }
      });

      return testNode;
    },
    writable: true,
  });

  return testNode;
}

export const test = vestTest;
