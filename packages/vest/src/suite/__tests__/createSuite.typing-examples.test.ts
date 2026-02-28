/**
 * Living documentation: 4 suite-typing patterns with all typed APIs exercised.
 *
 * Pattern 1 — Escape hatch:   create<null>(cb)        → all names are string
 * Pattern 2 — Config generic:  create<SuiteConfig>(cb) → fields/groups literal unions
 * Pattern 3 — Schema inferred: create(cb, schema)      → field names from schema keys
 * Pattern 4 — Untyped fallback: create(cb)             → all names are string
 */
import { describe, it } from 'vitest';

import {
  create,
  test,
  enforce,
  only,
  skip,
  include,
  optional,
} from '../../vest';

describe('Suite typing examples', () => {
  describe('Pattern 1: Escape hatch — create<null>()', () => {
    it('accepts any field and group names', () => {
      const suite = create<null>((_data: any) => {
        // Top-level functions inside callback — always untyped
        test('dynamic_field', () => {});
        only('dynamic_field');
        skip('dynamic_field');
        include('dynamic_field').when('other_field');
        optional('dynamic_field');
      });

      // Suite-level APIs all accept any string
      suite.remove('dynamic_field');
      suite.resetField('dynamic_field');
      suite.focus({ only: 'dynamic_field', onlyGroup: 'any_group' });
      suite.afterField('dynamic_field', () => {});

      // Type-level assertions — all accept any string
      const assertTestField = <K extends Parameters<typeof suite.test>[0]>(
        field: K,
      ) => field;
      const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
        field: K,
      ) => field;
      const assertIncludeField = <
        K extends Parameters<typeof suite.include>[0],
      >(
        field: K,
      ) => field;
      const assertOptionalField = <
        K extends Parameters<typeof suite.optional>[0],
      >(
        field: K,
      ) => field;

      assertTestField('dynamic_field');
      assertSkipField('dynamic_field');
      assertIncludeField('dynamic_field');
      assertOptionalField('dynamic_field');

      // Result selectors accept any string
      const result = suite.get();
      result.hasErrors('dynamic_field');
      result.getErrors('dynamic_field');
    });

    it('works with a schema while keeping field names open', () => {
      const schema = enforce.shape({
        name: enforce.isString(),
      });

      const suite = create<null>((_data: any) => {
        test('anything', () => {});
        only('anything');
      }, schema);

      const assertTestField = <K extends Parameters<typeof suite.test>[0]>(
        field: K,
      ) => field;

      assertTestField('anything');
      suite.get().hasErrors('anything');
    });
  });

  describe('Pattern 2: Config generic — create<{ fields; groups }>()', () => {
    it('restricts fields and groups to declared literals', () => {
      const suite = create<{
        fields: 'username' | 'email' | 'password';
        groups: 'auth' | 'profile';
      }>((_data: unknown) => {
        // Top-level functions inside callback — always untyped
        test('username', () => {});
        test('email', () => {});
        only('username');
        skip('email');
        include('username').when('email');
        optional('password');
      });

      // Suite-level APIs — positive cases
      suite.remove('username');
      suite.resetField('email');
      suite.focus({ only: 'username', onlyGroup: 'auth' });
      suite.only('email');
      suite.afterField('password', () => {});

      // Suite-bound APIs reject invalid fields
      // @ts-expect-error - invalid field for suite.remove
      suite.remove('invalid');

      // @ts-expect-error - invalid field for suite.resetField
      suite.resetField('invalid');

      // @ts-expect-error - invalid field for suite.afterField
      suite.afterField('invalid', () => {});

      // @ts-expect-error - invalid field for suite.focus only
      suite.focus({ only: 'invalid' });

      // @ts-expect-error - invalid group for suite.focus onlyGroup
      suite.focus({ onlyGroup: 'invalid' });
      const assertTestField = <K extends Parameters<typeof suite.test>[0]>(
        field: K,
      ) => field;
      const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
        field: K,
      ) => field;
      const assertIncludeField = <
        K extends Parameters<typeof suite.include>[0],
      >(
        field: K,
      ) => field;
      const assertOptionalField = <
        K extends Parameters<typeof suite.optional>[0],
      >(
        field: K,
      ) => field;
      const assertGroupName = <
        K extends Exclude<Parameters<typeof suite.group>[0], () => void>,
      >(
        group: K,
      ) => group;

      assertTestField('username');
      assertSkipField('email');
      assertIncludeField('password');
      assertOptionalField('username');
      assertGroupName('auth');

      // Reject invalid fields
      // @ts-expect-error - invalid field for suite.test
      assertTestField('invalid');

      // @ts-expect-error - invalid field for suite.skip
      assertSkipField('invalid');

      // @ts-expect-error - invalid field for suite.include
      assertIncludeField('invalid');

      // @ts-expect-error - invalid field for suite.optional
      assertOptionalField('invalid');

      // @ts-expect-error - invalid group for suite.group
      assertGroupName('invalid');

      // Result selectors
      const result = suite.get();
      result.hasErrors('username');
      result.getErrors('email');

      // @ts-expect-error - invalid field for result.hasErrors
      result.hasErrors('invalid');
    });
  });

  describe('Pattern 3: Schema inferred — create(cb, schema)', () => {
    it('derives field names from schema keys', () => {
      const schema = enforce.shape({
        firstName: enforce.isString(),
        lastName: enforce.isString(),
        age: enforce.isNumber(),
      });

      const suite = create(data => {
        // Top-level functions inside callback — always untyped
        test('firstName', () => {
          enforce(data.firstName).isNotBlank();
        });
        test('age', () => {
          enforce(data.age).greaterThan(0);
        });
        only('firstName');
        skip('lastName');
        include('firstName').when('lastName');
        optional('age');
      }, schema);

      // Suite-level APIs — positive cases
      suite.remove('firstName');
      suite.resetField('lastName');
      suite.focus({ only: 'age' });
      suite.only('firstName');
      suite.afterField('age', () => {});

      // Suite-bound APIs reject unknown fields
      // @ts-expect-error - unknown field for suite.remove
      suite.remove('unknown');

      // @ts-expect-error - unknown field for suite.resetField
      suite.resetField('unknown');

      // @ts-expect-error - unknown field for suite.afterField
      suite.afterField('unknown', () => {});

      // @ts-expect-error - unknown field for suite.focus only
      suite.focus({ only: 'unknown' });

      // Type-level assertions for typed methods
      const assertTestField = <K extends Parameters<typeof suite.test>[0]>(
        field: K,
      ) => field;
      const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
        field: K,
      ) => field;
      const assertIncludeField = <
        K extends Parameters<typeof suite.include>[0],
      >(
        field: K,
      ) => field;
      const assertOptionalField = <
        K extends Parameters<typeof suite.optional>[0],
      >(
        field: K,
      ) => field;

      assertTestField('firstName');
      assertSkipField('lastName');
      assertIncludeField('age');
      assertOptionalField('firstName');

      // Reject unknown fields
      // @ts-expect-error - unknown field for suite.test
      assertTestField('unknown');

      // @ts-expect-error - unknown field for suite.skip
      assertSkipField('unknown');

      // @ts-expect-error - unknown field for suite.include
      assertIncludeField('unknown');

      // @ts-expect-error - unknown field for suite.optional
      assertOptionalField('unknown');

      // Result selectors
      const result = suite.run({
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
      });
      result.hasErrors('firstName');
      result.getErrors('age');

      // @ts-expect-error - unknown field for result.hasErrors
      result.hasErrors('unknown');
    });
  });

  describe('Pattern 4: Untyped fallback — create(cb)', () => {
    it('accepts any field and group names', () => {
      const suite = create((_data: any) => {
        // Top-level functions inside callback — always untyped
        test('whatever', () => {});
        only('whatever');
        skip('whatever');
        include('whatever').when('other');
        optional('whatever');
      });

      // Suite-level APIs all accept any string
      suite.remove('whatever');
      suite.resetField('whatever');
      suite.focus({ only: 'whatever', onlyGroup: 'any_group' });
      suite.afterField('whatever', () => {});

      // Type-level assertions — all accept any string
      const assertTestField = <K extends Parameters<typeof suite.test>[0]>(
        field: K,
      ) => field;
      const assertSkipField = <K extends Parameters<typeof suite.skip>[0]>(
        field: K,
      ) => field;
      const assertIncludeField = <
        K extends Parameters<typeof suite.include>[0],
      >(
        field: K,
      ) => field;
      const assertOptionalField = <
        K extends Parameters<typeof suite.optional>[0],
      >(
        field: K,
      ) => field;

      assertTestField('whatever');
      assertSkipField('whatever');
      assertIncludeField('whatever');
      assertOptionalField('whatever');

      // Result selectors accept any string
      const result = suite.get();
      result.hasErrors('whatever');
      result.getErrors('whatever');
    });
  });
});
