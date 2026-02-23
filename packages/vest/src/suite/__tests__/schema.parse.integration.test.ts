import { describe, expect, it } from 'vitest';

import { create, enforce, test } from '../../vest';

describe('suite schema parse integration', () => {
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
          throw { message: 'parse failed', name: 'ValidationError' };
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

  it('treats Valibot parse errors as expected validation failures', () => {
    const schema = {
      parse: () => {
        throw { message: 'valibot parse failed', name: 'ValiError' };
      },
      run: () => ({
        message: 'quantity must be numeric',
        pass: false,
        path: ['quantity'],
        type: { quantity: NaN },
      }),
    };

    const suite = create(() => {}, schema as any);

    const result = suite.run({ quantity: 'not-a-number' } as any);

    expect(result.hasErrors('quantity')).toBe(true);
  });

  it('fails with a clear error when schema is misconfigured', () => {
    const suite = create(() => {}, { unexpected: true } as any);

    const result = suite.run({ quantity: '10' } as any);

    expect(result.hasErrors()).toBe(true);
    expect(JSON.stringify(result.getErrors())).toContain(
      'Misconfigured schema',
    );
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
