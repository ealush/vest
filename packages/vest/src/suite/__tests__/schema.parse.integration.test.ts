import { describe, expect, it } from 'vitest';

import { create, enforce, test } from '../../vest';

describe('suite schema integration', () => {
  it('validates schema object and passes data into suite body', () => {
    const schema = enforce.loose({ amount: enforce.isNumber() });

    let callbackValue: unknown;

    const suite = create((data: any) => {
      callbackValue = data.amount;

      test('amount', () => {
        enforce(data.amount).isNumber();
      });
    }, schema);

    const result = suite.run({ amount: 12 });

    expect(callbackValue).toBe(12);
    expect(result.isValid()).toBe(true);
    expect(result.value).toEqual({ amount: 12 });
  });

  it('validates nested shape schema', () => {
    const schema = enforce.loose({
      profile: enforce.shape({
        age: enforce.isNumber(),
        name: enforce.isString(),
      }),
    });

    let callbackProfile: any;

    const suite = create((data: any) => {
      callbackProfile = data.profile;

      test('profile.age', () => {
        enforce(data.profile.age).isNumber();
      });

      test('profile.name', () => {
        enforce(data.profile.name).isString();
      });
    }, schema);

    const result = suite.run({
      profile: { age: 33, name: 'Jane' },
    });

    expect(callbackProfile).toEqual({ age: 33, name: 'Jane' });
    expect(result.isValid()).toBe(true);
    expect(result.value).toEqual({
      profile: { age: 33, name: 'Jane' },
    });
  });

  it('validates array of objects schema', () => {
    const schema = enforce.loose({
      users: enforce.isArrayOf(
        enforce.shape({
          age: enforce.isNumber(),
          name: enforce.isString(),
        }),
      ),
    });

    let callbackUsers: any;

    const suite = create((data: any) => {
      callbackUsers = data.users;
      test('users', () => {
        enforce(data.users).isNotEmpty();
      });
    }, schema);

    const result = suite.run({
      users: [
        { age: 25, name: 'Alice' },
        { age: 30, name: 'Bob' },
      ],
    });

    expect(callbackUsers).toEqual([
      { age: 25, name: 'Alice' },
      { age: 30, name: 'Bob' },
    ]);
    expect(result.isValid()).toBe(true);
    expect(result.value).toEqual({
      users: [
        { age: 25, name: 'Alice' },
        { age: 30, name: 'Bob' },
      ],
    });
  });

  it('provides validated data in callback and result.value', () => {
    const schema = enforce.loose({
      quantity: enforce.isNumber(),
      label: enforce.isString(),
    });

    let callbackData: any;

    const suite = create((data: any) => {
      callbackData = data;

      test('quantity', () => {
        enforce(data.quantity).isNumber();
      });
    }, schema);

    const result = suite.run({ quantity: 10, label: 'item' });

    expect(callbackData).toEqual({ quantity: 10, label: 'item' });
    expect(result.value).toEqual({ quantity: 10, label: 'item' });
    // @ts-expect-error - types is defined at runtime when schema is used, but typed as undefined in SuiteResult return
    expect(result.types?.output).toEqual({
      quantity: 10,
      label: 'item',
    });
  });

  it('loose schema allows extra payload keys', () => {
    const schema = enforce.loose({
      amount: enforce.isNumber(),
    });

    let callbackAmount: unknown;

    const suite = create((data: any) => {
      callbackAmount = data.amount;
      test('amount', () => {
        enforce(data.amount).isNumber();
      });
    }, schema);

    const result = suite.run({ amount: 7, extra: 'keep' });

    expect(callbackAmount).toBe(7);
    expect(result.value).toEqual({ amount: 7, extra: 'keep' });
  });

  it('falls back to original input when schema validation fails', () => {
    const schema = enforce.loose({ quantity: enforce.isNumber() });

    let callbackData: any;

    const suite = create(data => {
      callbackData = data;
      test('quantity', () => {
        enforce(data.quantity).isNotEmpty();
      });
    }, schema);

    // @ts-expect-error - testing invalid input
    const result = suite.run({ quantity: 'not-a-number' });

    expect(callbackData).toEqual({ quantity: 'not-a-number' });
    expect(result.hasErrors('quantity')).toBe(true);
    expect(result.value).toBeUndefined();
  });

  it('maps schema validation paths into suite errors', () => {
    const schema = enforce.shape({ security: enforce.isString() });

    const suite = create(() => {}, schema);

    // @ts-expect-error - testing invalid input
    const result = suite.run({ name: 'safe' });

    expect(result.hasErrors()).toBe(true);
    expect(result.hasErrors('security')).toBe(true);
  });
});
