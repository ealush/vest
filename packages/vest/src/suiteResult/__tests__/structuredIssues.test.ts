import { describe, expect, it } from 'vitest';

import { create, test } from '../../vest';

describe('structured issues', () => {
  const issue = {
    code: 'too_short',
    message: 'Password must contain at least 12 characters',
    meta: { minimum: 12 },
    path: ['account', 'password'],
  } as const;

  it('preserves structured failure data while keeping string selectors compatible', () => {
    const suite = create(() => {
      test('account.password', issue, () => false);
    });

    const result = suite.run();

    expect(result.getErrors('account.password')).toEqual([issue.message]);
    expect(result.errors[0]).toMatchObject({
      code: issue.code,
      fieldName: 'account.password',
      message: issue.message,
      meta: issue.meta,
      path: issue.path,
    });
    expect(result.issues).toEqual([
      {
        code: issue.code,
        message: issue.message,
        meta: issue.meta,
        path: issue.path,
      },
    ]);
  });

  it('exposes structured issues through Standard Schema', () => {
    const suite = create(() => {
      test('account.password', issue, () => false);
    });

    expect(suite['~standard'].validate({})).toEqual({
      issues: [
        {
          code: issue.code,
          message: issue.message,
          meta: issue.meta,
          path: issue.path,
        },
      ],
    });
  });

  it('keeps the existing issue path for string messages', () => {
    const suite = create(() => {
      test('account.password', 'Invalid password', () => false);
    });

    expect(suite.run().issues).toEqual([
      { message: 'Invalid password', path: ['account.password'] },
    ]);
  });
});
