import { describe, expect, it } from 'vitest';

import { enforce } from '../n4s';

describe('structured issues', () => {
  it('decorates the immediately preceding rule', () => {
    const rule = enforce
      .isString()
      .issue({ code: 'not_string', message: 'Must be text' })
      .longerThanOrEquals(5)
      .issue({ code: 'too_short', message: 'Use at least 5 characters' });

    // @ts-expect-error - Exercising the runtime type guard.
    expect(rule.validate(42)).toEqual({
      issues: [
        {
          code: 'not_string',
          message: 'Must be text',
          meta: { actual: { type: 'number' }, rule: 'isString' },
          path: [],
        },
      ],
    });

    expect(rule.validate('abc')).toEqual({
      issues: [
        {
          code: 'too_short',
          message: 'Use at least 5 characters',
          meta: {
            actual: { length: 3, type: 'string' },
            inclusive: true,
            minimum: 5,
            rule: 'longerThanOrEquals',
          },
          path: [],
        },
      ],
    });
  });

  it('derives the path while preserving field rule metadata through shapes', () => {
    const schema = enforce.shape({
      account: enforce.shape({
        password: enforce.isString().longerThanOrEquals(12).issue({
          code: 'too_short',
          message: 'Password must contain at least 12 characters',
        }),
      }),
    });

    expect(schema.validate({ account: { password: 'secret' } })).toEqual({
      issues: [
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
      ],
    });
  });

  it('does not expose rejected values or opaque rule arguments', () => {
    const rejected = 'private@example.com';
    const rule = enforce
      .isString()
      .equals('another-private@example.com')
      .issue({ code: 'mismatch', message: 'Values do not match' });

    const result = rule.validate(rejected);

    expect(JSON.stringify(result)).not.toContain(rejected);
    expect(JSON.stringify(result)).not.toContain('another-private@example.com');
  });
});
