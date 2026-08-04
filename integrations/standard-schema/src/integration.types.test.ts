import type { StandardSchemaV1 } from '@standard-schema/spec';
import { expect, expectTypeOf, it } from 'vitest';

import type { Equal, Expect } from '@vest/integration-kit';

import { accountSchema, accountSuite } from './suite';
import type { AccountInput, AccountOutput } from './suite';

it('infers Standard Schema input and transformed output types', () => {
  type SuiteInput = StandardSchemaV1.InferInput<typeof accountSuite>;
  type SuiteOutput = StandardSchemaV1.InferOutput<typeof accountSuite>;
  type SchemaInput = StandardSchemaV1.InferInput<typeof accountSchema>;
  type SchemaOutput = StandardSchemaV1.InferOutput<typeof accountSchema>;

  type SuiteInputMatches = Expect<Equal<SuiteInput, AccountInput>>;
  type SuiteOutputMatches = Expect<Equal<SuiteOutput, AccountOutput>>;
  type SchemaInputMatches = Expect<Equal<SchemaInput, AccountInput>>;
  type SchemaOutputMatches = Expect<Equal<SchemaOutput, AccountOutput>>;

  expect(true).toBe(true);
  expectTypeOf<SuiteInputMatches>().toEqualTypeOf<true>();
  expectTypeOf<SuiteOutputMatches>().toEqualTypeOf<true>();
  expectTypeOf<SchemaInputMatches>().toEqualTypeOf<true>();
  expectTypeOf<SchemaOutputMatches>().toEqualTypeOf<true>();

  // @ts-expect-error age must be a numeric string or number
  const invalidAge: SuiteInput['profile']['age'] = false;
  expect(invalidAge).toBe(false);
});
