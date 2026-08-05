import type { StandardSchemaV1 } from '@standard-schema/spec';
import { isDeepStrictEqual } from 'node:util';

import { assertIssue } from '../assertions/issues.js';
import { assert } from '../assertions/types.js';

export interface StandardSchemaContractCases<Input, Output> {
  validInput: Input;
  invalidInput: Input;
  expectedOutput?: Output;
  expectedIssues: readonly {
    message?: string;
    path?: readonly PropertyKey[];
  }[];
  expectedIssueCount?: number;
  synchronous?: boolean;
  vendor?: string;
}

export async function runStandardSchemaContract<Input, Output>(
  schema: StandardSchemaV1<Input, Output>,
  cases: StandardSchemaContractCases<Input, Output>,
): Promise<void> {
  const standard = schema['~standard'];
  assert(standard.version === 1, 'Expected Standard Schema version 1');
  assert(
    standard.vendor === (cases.vendor ?? 'vest'),
    `Unexpected Standard Schema vendor: ${standard.vendor}`,
  );

  const validRun = standard.validate(cases.validInput);
  assertExecutionMode(validRun, cases.synchronous);
  const valid = await validRun;
  assert('value' in valid, 'Expected valid input to produce a value');
  if ('expectedOutput' in cases) {
    assert(
      isDeepStrictEqual(valid.value, cases.expectedOutput),
      'Validated output did not match the expected parsed value',
    );
  }

  const invalidRun = standard.validate(cases.invalidInput);
  assertExecutionMode(invalidRun, cases.synchronous);
  const invalid = await invalidRun;
  assert(invalid.issues, 'Expected invalid input to produce issues');
  if (cases.expectedIssueCount !== undefined) {
    assert(
      invalid.issues.length === cases.expectedIssueCount,
      `Expected ${cases.expectedIssueCount} issues, received ${invalid.issues.length}`,
    );
  }
  for (const expectedIssue of cases.expectedIssues) {
    assertIssue(invalid.issues, expectedIssue);
  }

  const repeated = await standard.validate(cases.validInput);
  assert(
    'value' in repeated,
    'Expected repeated validation to remain independent',
  );
}

function assertExecutionMode<Output>(
  result:
    | StandardSchemaV1.Result<Output>
    | Promise<StandardSchemaV1.Result<Output>>,
  synchronous: boolean | undefined,
): void {
  if (synchronous === undefined) {
    return;
  }
  const isPromise = typeof (result as Promise<unknown>).then === 'function';
  assert(
    synchronous !== isPromise,
    synchronous
      ? 'Expected synchronous Standard Schema validation'
      : 'Expected asynchronous Standard Schema validation',
  );
}
