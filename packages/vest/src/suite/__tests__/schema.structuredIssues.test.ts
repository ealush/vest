import { enforce } from 'n4s';
import { describe, expect, it } from 'vitest';

import { create } from '../../vest';

describe('schema structured issues', () => {
  it('transports n4s issue details into Vest results', () => {
    const suite = create(
      () => {},
      enforce.shape({
        account: enforce.shape({
          password: enforce.isString().longerThanOrEquals(12).issue({
            code: 'too_short',
            message: 'Password must contain at least 12 characters',
          }),
        }),
      }),
    );

    const result = suite.run({ account: { password: 'secret' } });

    expect(result.errors[0]).toMatchObject({
      code: 'too_short',
      fieldName: 'account.password',
      meta: {
        actual: { length: 6, type: 'string' },
        inclusive: true,
        minimum: 12,
        rule: 'longerThanOrEquals',
      },
      path: ['account', 'password'],
    });
    expect(result.issues).toEqual([
      {
        code: 'too_short',
        message: 'Password must contain at least 12 characters',
        meta: {
          actual: { length: 6, type: 'string' },
          inclusive: true,
          minimum: 12,
          rule: 'longerThanOrEquals',
        },
        path: ['account', 'password'],
      },
    ]);
  });
});
