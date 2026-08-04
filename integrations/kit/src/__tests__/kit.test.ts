import { describe, expect, expectTypeOf, it } from 'vitest';

import { createAccountSuite, invalidAccount, validAccount } from '../index.js';
import { defineIntegrationRegistry } from '../registry.js';
import { runStandardSchemaContract } from '../contracts/standard-schema.js';
import type { AccountInput } from '../fixtures/account.js';
import type { Equal, Expect } from '../assertions/types.js';

describe('integration kit', () => {
  it('exercises a public Vest suite through the shared Standard Schema contract', async () => {
    const suite = createAccountSuite();

    await expect(
      runStandardSchemaContract(suite, {
        validInput: validAccount,
        invalidInput: invalidAccount,
        expectedIssueCount: 2,
        expectedIssues: [{ path: ['email'] }, { path: ['password'] }],
        synchronous: true,
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects duplicate registry coordinates', () => {
    const record = {
      id: 'sample',
      title: 'Sample',
      category: 'other',
      strategy: 'standard-schema',
      workspace: 'integrations/sample',
      websiteRoute: '/docs/integrations/sample',
      testedVersions: { vest: '6.3.2', integration: '1.0.0' },
      capabilities: {
        synchronous: true,
        asynchronous: false,
        nestedPaths: false,
        multipleIssues: false,
        inputInference: true,
        outputInference: true,
        transformedOutput: false,
        focusedExecution: false,
        retainedState: false,
        raceSafety: false,
      },
      upstream: {
        repository: 'example/sample',
        targetFiles: [],
        contributionType: 'documentation',
      },
      status: 'planned',
      lastVerified: '2026-08-04',
      limitations: [],
    } as const;

    expect(() => defineIntegrationRegistry([record, record])).toThrow(
      'Duplicate integration id: sample',
    );
  });

  it('preserves fixture input types', () => {
    expect(validAccount.email).toBe('dev@example.com');
    expectTypeOf(validAccount).toEqualTypeOf<AccountInput>();
    type AccountTypeIsStable = Expect<Equal<typeof validAccount, AccountInput>>;
    expectTypeOf<AccountTypeIsStable>().toEqualTypeOf<true>();
  });
});
