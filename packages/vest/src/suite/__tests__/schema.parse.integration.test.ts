import { describe, expect, it } from 'vitest';

import { create, enforce, test } from '../../vest';

describe('suite schema parse integration', () => {
  it('passes parsed schema object output into suite body', () => {
    const schema = {
      parse: (value: any) => ({ amount: Number(value.amount) }),
      run: (value: any) => ({ pass: true, type: value }),
    } as any;

    let callbackValue: unknown;

    const suite = create((data: any) => {
      callbackValue = data.amount;

      test('amount', () => {
        enforce(data.amount).isNumber();
      });
    }, schema);

    const result = suite.run({ amount: '12' } as any);

    expect(callbackValue).toBe(12);
    expect(result.isValid()).toBe(true);
    expect(result.value).toEqual({ amount: 12 });
  });

  it('passes parsed nested schema object output into suite body', () => {
    const schema = {
      parse: (value: any) => ({
        profile: {
          age: Number(value.profile.age),
          name: String(value.profile.name).trim(),
        },
      }),
      run: (value: any) => ({ pass: true, type: value }),
    } as any;

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
      profile: { age: '33', name: '  Jane  ' },
    } as any);

    expect(callbackProfile).toEqual({ age: 33, name: 'Jane' });
    expect(result.isValid()).toBe(true);
    expect(result.value).toEqual({
      profile: { age: 33, name: 'Jane' },
    });
  });

  it('passes parsed output to callback and result.value', () => {
    const schema = {
      parse: (value: any) => ({
        quantity: Number(value.quantity),
        label: String(value.label).trim(),
      }),
      run: (value: any) => {
        const quantity = Number(value.quantity);
        if (Number.isNaN(quantity)) {
          return {
            message: 'quantity must be numeric',
            pass: false,
            path: ['quantity'],
            type: value,
          };
        }

        return {
          pass: true,
          type: {
            quantity,
            label: String(value.label).trim(),
          },
        };
      },
    };

    let callbackData: any;

    const suite = create((data: any) => {
      callbackData = data;

      test('quantity', () => {
        enforce(data.quantity).isNumber();
      });
    }, schema as any);

    const result = suite.run({ quantity: '10', label: '  item  ' } as any);

    expect(callbackData).toEqual({ quantity: 10, label: 'item' });
    expect(result.value).toEqual({ quantity: 10, label: 'item' });
    expect((result.types as any)?.output).toEqual({
      quantity: 10,
      label: 'item',
    });
  });

  it('uses parsed data with extra payload keys', () => {
    const schema = {
      parse: (value: any) => ({
        amount: Number(value.amount),
        extra: value.extra,
      }),
      run: (value: any) => ({
        pass: !Number.isNaN(Number(value.amount)),
        path: ['amount'],
        type: { amount: Number(value.amount), extra: value.extra },
      }),
    };

    let callbackAmount: unknown;

    const suite = create((data: any) => {
      callbackAmount = data.amount;
      test('amount', () => {
        enforce(data.amount).isNumber();
      });
    }, schema as any);

    const result = suite.run({ amount: '7', extra: 'keep' } as any);

    expect(callbackAmount).toBe(7);
    expect(result.value).toEqual({ amount: 7, extra: 'keep' });
  });

  it('falls back to original input when parse fails', () => {
    const schema = {
      parse: (value: any) => {
        const quantity = Number(value.quantity);
        if (Number.isNaN(quantity)) {
          throw new Error('parse failed');
        }

        return { quantity };
      },
      run: (value: any) => ({
        message: 'quantity must be numeric',
        pass: !Number.isNaN(Number(value.quantity)),
        path: ['quantity'],
        type: { quantity: Number(value.quantity) },
      }),
    };

    let callbackData: any;

    const suite = create((data: any) => {
      callbackData = data;
      test('quantity', () => {
        enforce(data.quantity).isNotEmpty();
      });
    }, schema as any);

    const result = suite.run({ quantity: 'not-a-number' } as any);

    expect(callbackData).toEqual({ quantity: 'not-a-number' });
    expect(result.hasErrors('quantity')).toBe(true);
    expect(result.value).toBeUndefined();
  });

  it('maps security-related schema run paths into suite errors', () => {
    const schema = {
      parse: (value: any) => value,
      run: () => ({
        message: 'dangerous key',
        pass: false,
        path: ['security'],
        type: {},
      }),
    };

    const suite = create(() => {}, schema as any);

    const result = suite.run({ name: 'safe' } as any);

    expect(result.hasErrors()).toBe(true);
    expect(result.hasErrors('security')).toBe(true);
  });
});
