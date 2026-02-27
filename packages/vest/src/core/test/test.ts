/**
 * Module: `src/core/test/test.ts`.
 *
 * Provides `test`-related runtime and type utilities used by `vest`.
 */
import { IsolateKey } from 'vestjs-runtime';
import { useEmit } from '../VestBus/VestBus';

import { IsolateTest, TIsolateTest } from '../isolate/IsolateTest/IsolateTest';

import { TestFn } from './TestTypes';
import { useAttemptRunTest } from './testLevelFlowControl/runTest';
import { validateTestParams } from './validateTestParams';

/**
 * Registers and executes a Vest test isolate for a field.
 *
 * Overloads support optional custom messages and isolate keys for deterministic
 * reconciliation across reruns.
 */
function vestTest(fieldName: string, message: string, cb: TestFn): TIsolateTest;
function vestTest(fieldName: string, cb: TestFn): TIsolateTest;
function vestTest(
  fieldName: string,
  message: string,
  cb: TestFn,
  key: IsolateKey,
): TIsolateTest;
function vestTest(fieldName: string, cb: TestFn, key: IsolateKey): TIsolateTest;
// eslint-disable-next-line vest-internal/use-use
function vestTest(
  fieldName: string,
  ...args:
    | [message: string, cb: TestFn]
    | [cb: TestFn]
    | [message: string, cb: TestFn, key: IsolateKey]
    | [cb: TestFn, key: IsolateKey]
): TIsolateTest {
  // Normalize overload input into a single strongly-typed payload.
  const {
    fieldName: safeFieldName,
    message,
    testFn,
    key,
  } = validateTestParams(fieldName, ...args).unwrap();

  // Capture the test definition object passed into the isolate factory.
  const testObjectInput = { fieldName: safeFieldName, message, testFn };

  // This invalidates the suite cache.
  useEmit('TEST_RUN_STARTED');

  return IsolateTest(useAttemptRunTest, testObjectInput, key);
}

export const test = vestTest;
