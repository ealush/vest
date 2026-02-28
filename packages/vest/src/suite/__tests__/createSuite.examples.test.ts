import { describe, expect, expectTypeOf, it } from 'vitest';

import { create, enforce, group, only, skip, test } from '../../vest';

type AssertTrue<T extends true> = T;
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? (<T>() => T extends B ? 1 : 2) extends <T>() => T extends A ? 1 : 2
      ? true
      : false
    : false;

const userSchema = enforce.shape({
  username: enforce.isString(),
  password: enforce.isString(),
  email: enforce.isString(),
});

const checkoutSchema = enforce.shape({
  cart_items: enforce.isArrayOf(enforce.isString()),
  billing_address: enforce.isString(),
  payment_token: enforce.isString(),
});

const passwordResetSchema = enforce.shape({
  password: enforce.isString(),
  confirmPassword: enforce.isString(),
});

const strictSchema = enforce.shape({
  id: enforce.isNumber(),
  enabled: enforce.isBoolean(),
});

describe('createSuite examples - permutation 1: happy path schema inference', () => {
  it('example 1: infers flat schema fields and supports safe destructuring inside callback', () => {
    const suite = create(data => {
      const { test, optional } = suite;

      test('username', () => {
        enforce(data.username).isNotBlank();
      });
      optional('email');

      // @ts-expect-error - unknown schema key
      test('typo_field', () => true);
    }, userSchema);

    expect(() =>
      suite.run({
        username: 'john',
        password: '123456',
        email: 'john@example.com',
      }),
    ).not.toThrow();
  });

  it('example 2: validates nested-ish checkout usage with inferred focus/remove keys', () => {
    const checkoutSuite = create(data => {
      test('cart_items', () => {
        enforce(data.cart_items.length).greaterThan(0);
      });
      test('billing_address', () => {
        enforce(data.billing_address).isNotBlank();
      });
    }, checkoutSchema);

    checkoutSuite.remove('billing_address');
    checkoutSuite.focus({ only: 'cart_items' }).run({
      cart_items: ['sku_1'],
      billing_address: '',
      payment_token: 'token',
    });

    // focus/only remain permissive for dynamic/nested field names
    checkoutSuite.focus({ only: 'unknown_field' }).run({
      cart_items: ['sku_1'],
      billing_address: '',
      payment_token: 'token',
    });
  });

  it('example 3: infers dependent-field context methods', () => {
    const resetSuite = create(data => {
      test('password', () => {
        enforce(data.password).isNotBlank();
      });

      test('confirmPassword', () => {
        enforce(data.confirmPassword).equals(data.password);
      });
    }, passwordResetSchema);

    const assertIncludeField = <
      K extends Parameters<typeof resetSuite.include>[0],
    >(
      field: K,
    ) => field;

    assertIncludeField('confirmPassword');

    // @ts-expect-error - not in schema keys
    assertIncludeField('confirm_password_typo');

    resetSuite.afterField('password', () => {
      expect(resetSuite.get().hasErrors('password')).toBeTypeOf('boolean');
    });
  });

  it('example 4: supports schema-backed inferred data shape checks', () => {
    const configSchema = enforce.shape({
      status: enforce.isString(),
      retries: enforce.isNumber(),
    });

    const suite = create(data => {
      void (0 as unknown as AssertTrue<
        IsEqual<typeof data, { status: string; retries: number }>
      >);

      test('status', () => {
        enforce(data.status).isString();
      });
    }, configSchema);

    expectTypeOf<Parameters<typeof suite.run>[0]>().toEqualTypeOf<{
      status: string;
      retries: number;
    }>();
  });

  it('example 12: API coverage checklist for field/group typing behavior', () => {
    const suite = create(data => {
      // context APIs
      test('username', 'Username is required', () => {
        enforce(data.username).isNotBlank();
      });
      only('username');
      skip('email');
      suite.include('password').when(() => true);
      suite.optional('email');
      group('auth', () => {
        test('password', 'Password is required', () => {
          enforce(data.password).isNotBlank();
        });
      });
    }, userSchema);

    // suite APIs
    suite.remove('username');
    suite.resetField('email');
    suite.focus({ only: 'password', skipGroup: 'runtime_group' }).run({
      username: 'john',
      password: '123456',
      email: 'john@example.com',
    });
    suite.only('username').run({
      username: 'john',
      password: '123456',
      email: 'john@example.com',
    });
    suite.afterField('username', () => {
      expect(suite.get().hasErrors('username')).toBeTypeOf('boolean');
    });
  });
});

describe('createSuite examples - permutation 2: explicit config generics', () => {
  it('example 5: restricts test/group names to explicit literal unions', () => {
    const suite = create<{ fields: 'id' | 'role'; groups: 'auth' | 'admin' }>(
      (_data: unknown) => {},
    );

    const assertField = <K extends Parameters<typeof suite.test>[0]>(
      field: K,
    ) => field;

    assertField('id');
    assertField('role');

    // @ts-expect-error - invalid field literal
    assertField('email');

    suite.focus({ onlyGroup: 'admin' });

    // @ts-expect-error - invalid group literal
    suite.focus({ onlyGroup: 'payments' });
  });

  it('example 6: explicit config with domain model callback type', () => {
    type UserModel = {
      id: string;
      role: 'viewer' | 'editor';
      active: boolean;
    };

    const suite = create<
      { fields: keyof UserModel; groups: 'API' },
      UserModel,
      (data: UserModel) => void
    >(data => {
      test('id', () => {
        enforce(data.id).isNotBlank();
      });

      test('role', () => {
        enforce(data.role).inside(['viewer', 'editor']);
      });
    });

    suite.run({ id: 'u_1', role: 'viewer', active: true });

    // @ts-expect-error - role union should be enforced
    suite.run({ id: 'u_1', role: 'owner', active: true });
  });

  it('example 7: config generic overload intentionally rejects schema values', () => {
    // @ts-expect-error - config-generic overload is schema-less by design
    create<{ fields: 'id' | 'email' }>(() => {}, strictSchema);
  });
});

describe('createSuite examples - permutation 3: escape hatch / untyped usage', () => {
  it('example 8: no schema/no generic falls back to untyped callback and fields', () => {
    const suite = create((data: any) => {
      test('literally_anything', () => {
        expect(data).toBeDefined();
      });
    });

    const objectResult = suite.run({ random: 'value' });
    const arrayResult = suite.run(['x']);
    const numberResult = suite.run(1);

    expect(objectResult.hasErrors()).toBe(false);
    expect(arrayResult.hasErrors()).toBe(false);
    expect(numberResult.hasErrors()).toBe(false);
  });

  it('example 9: using explicit any generic with schema keeps runtime schema checks while allowing loose field APIs', () => {
    const suite = create<any>((data: any) => {
      test('unmapped_field', () => {
        expect(data).toBeDefined();
      });
    }, strictSchema);

    const result = suite.run({ id: 1, enabled: false });
    expect(result.valid).toBe(true);

    // still schema-validated at runtime
    const bad = suite.run({ id: 'oops', enabled: false } as any);
    expect(bad.valid).toBe(false);
  });

  it('example 10: supports dynamic field generation from object keys', () => {
    const suite = create<any>((data: Record<string, unknown>) => {
      for (const fieldName of Object.keys(data)) {
        test(fieldName, () => {
          expect(data[fieldName]).toBeDefined();
        });
      }
    });

    suite.run({ dynamic_a: 1, dynamic_b: 2 });
  });

  it('example 11: untyped suites allow runtime-generated focus group names', () => {
    const dynamicGroups = ['dynamic_group_1', 'dynamic_group_2'];

    const suite = create<any>(() => {
      test('field_x', () => true);
    });

    suite.focus({ skipGroup: dynamicGroups }).run({ field_x: 'ok' } as any);
  });
});
