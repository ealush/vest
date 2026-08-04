import { describe, expect, it, vi } from 'vitest';

import { runStandardSchemaContract } from '@vest/integration-kit';

import { validateJson } from './integration';
import { accountSchema, accountSuite, createUsernameSuite } from './suite';

const validInput = {
  email: '  DEV@EXAMPLE.COM  ',
  profile: { age: '42', name: '  Ada  ' },
};

const invalidBusinessInput = {
  email: 'invalid',
  profile: { age: '42', name: 'A' },
};

describe('Vest Standard Schema compatibility', () => {
  it('passes the shared synchronous suite contract', async () => {
    await expect(
      runStandardSchemaContract(accountSuite, {
        expectedIssueCount: 3,
        expectedIssues: [
          { path: ['profile', 'name'] },
          { message: 'Email must contain an @ sign', path: ['email'] },
          {
            message: 'Email must use the example.com domain',
            path: ['email'],
          },
        ],
        expectedOutput: {
          email: 'dev@example.com',
          profile: { age: 42, name: 'Ada' },
        },
        invalidInput: invalidBusinessInput,
        synchronous: true,
        validInput,
      }),
    ).resolves.toBeUndefined();
  });

  it('exposes the specification metadata on both public surfaces', () => {
    expect(accountSuite['~standard']).toMatchObject({
      vendor: 'vest',
      version: 1,
    });
    expect(accountSchema['~standard']).toMatchObject({
      vendor: 'n4s',
      version: 1,
    });
  });

  it('returns nested Enforce paths and transformed output', async () => {
    expect(accountSchema['~standard'].validate(validInput)).toEqual({
      value: {
        email: 'dev@example.com',
        profile: { age: 42, name: 'Ada' },
      },
    });
    expect(accountSchema.parse(validInput)).toEqual({
      email: 'dev@example.com',
      profile: { age: 42, name: 'Ada' },
    });

    const invalid = await accountSchema['~standard'].validate({
      email: 'dev@example.com',
      profile: { age: 'not-a-number', name: 'Ada' },
    });
    expect(invalid.issues?.[0]?.path).toEqual(['profile', 'age']);
  });

  it('awaits asynchronous valid and invalid results', async () => {
    const isAvailable = vi.fn(async (username: string) => username !== 'taken');
    const suite = createUsernameSuite(isAvailable);

    const valid = suite['~standard'].validate({ username: 'available' });
    expect(valid).toBeInstanceOf(Promise);
    await expect(valid).resolves.toEqual({ value: { username: 'available' } });

    await expect(
      suite['~standard'].validate({ username: 'taken' }),
    ).resolves.toEqual({
      issues: [{ message: 'Username is already taken', path: ['username'] }],
    });
  });

  it('does not retain interactive state between repeated validations', async () => {
    const firstInvalid =
      await accountSuite['~standard'].validate(invalidBusinessInput);
    const valid = await accountSuite['~standard'].validate(validInput);
    const secondInvalid =
      await accountSuite['~standard'].validate(invalidBusinessInput);

    expect(firstInvalid).toEqual(secondInvalid);
    expect(valid).toHaveProperty('value');
  });

  it('normalizes valid, invalid, and malformed JSON for consumers', async () => {
    await expect(
      validateJson(accountSuite, JSON.stringify(validInput)),
    ).resolves.toMatchObject({ success: true });
    await expect(
      validateJson(accountSuite, JSON.stringify(invalidBusinessInput)),
    ).resolves.toMatchObject({
      issues: expect.arrayContaining([
        expect.objectContaining({ path: ['profile', 'name'] }),
      ]),
      success: false,
    });
    await expect(validateJson(accountSuite, '{')).resolves.toEqual({
      issues: [{ message: 'Input is not valid JSON', path: [] }],
      success: false,
    });
  });
});
