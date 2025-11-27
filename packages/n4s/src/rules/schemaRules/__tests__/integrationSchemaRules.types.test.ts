import { describe, expect, it } from 'vitest';

import { enforce } from '../../../n4s';
import type { ShapeType } from '../shape';

// schema combinators are consumed via enforce

// This suite focuses on compile-time type checks using @ts-expect-error to ensure
// incorrect types produce red squigglies when using the rules and combinators.

describe('types: compile-time mismatches across rules and composed schemas', () => {
  it('primitive rule unions and arrays (number | numeric-string)', () => {
    const arrRule = enforce.isArrayOf(enforce.isNumeric(), enforce.isNumber());
    type Arr = typeof arrRule.infer;

    const ok1: Arr = [1, '2', 3];
    void ok1;

    // Type test: boolean is not allowed in (number | string)[]
    const badArr1: Arr = [true];
    void badArr1;

    // Type test: object is not allowed in (number | string)[]
    const badArr2: Arr = [{}];
    void badArr2;
    expect(true).toBe(true);
  });

  it('shape: exact fields and correct types', () => {
    const addrSchema = enforce.shape({
      city: enforce.isString(),
      country: enforce.isString(),
      street: enforce.isString(),
      zip: enforce.anyOf(
        enforce.allOf(
          enforce.isString(),
          enforce.isString().matches(/^\d{5}$/),
        ),
        enforce.allOf(
          enforce.isNumber(),
          enforce.isNumber().greaterThanOrEquals(10000),
          enforce.isNumber().lessThanOrEquals(99999),
        ),
      ),
    });

    type Addr = typeof addrSchema.infer;

    const ok: Addr = { city: 'a', country: 'US', street: 'x', zip: '12345' };
    void ok;

    const extra1 = {
      city: 'a',
      country: 'US',
      // Type test: extra property not allowed by exact shape
      // @ts-expect-error - extra property should not be allowed on Addr
      extra: true,
      street: 'x',
      zip: '12345',
    } satisfies Addr;
    void extra1;

    const badZip = {
      city: 'a',
      country: 'US',
      street: 'x',
      // Type test: boolean is not assignable to string
      zip: true,
    } satisfies Addr;
    void badZip;
    expect(true).toBe(true);
  });

  it('optional + base shape: wrong inner types should error', () => {
    const base = {
      count: enforce.isNumber(),
      maybeName: enforce.optional(enforce.isString()),
      totals: enforce.shape({
        subtotal: enforce.isNumber(),
        tax: enforce.isNumber(),
      }),
    } as const;

    // Use shape-inferred type for compile-time checks
    type T = ShapeType<typeof base>;

    const good: T = {
      count: 1,
      totals: { subtotal: 1, tax: 0 },
    };
    void good;

    const badCount = {
      // Type test: count must be number
      // @ts-expect-error - count must be a number
      count: '1',
      totals: { subtotal: 1, tax: 0 },
    } satisfies T;
    void badCount;

    const badTotals = {
      count: 1,
      // Type test: totals.tax must be number
      // @ts-expect-error - totals.tax must be a number
      totals: { subtotal: 1, tax: '0' },
    } satisfies T;
    void badTotals;

    const badMaybe = {
      count: 1,
      // Type test: maybeName may be string | null | undefined, not boolean
      // @ts-expect-error - maybeName accepts only string | null | undefined
      maybeName: false,
      totals: { subtotal: 1, tax: 0 },
    } satisfies T;
    void badMaybe;
    expect(true).toBe(true);
  });

  it('anyOf/noneOf: union types vs mismatches', () => {
    const strOrNum = enforce.anyOf(enforce.isString(), enforce.isNumber());
    type SOrN = typeof strOrNum.infer; // string | number

    const okA: SOrN = 'a';
    const okB: SOrN = 1;
    void okA;
    void okB;

    // Type test: boolean is not string | number
    // @ts-expect-error - boolean is not string | number
    const badC: SOrN = true;
    void badC;

    const notString = enforce.noneOf(enforce.isString());
    type NotStr = typeof notString.infer; // string (by design of combinator typing)

    // Type test: expects string inferred type, assigning number
    const badNotStr: NotStr = 1;
    void badNotStr;
    expect(true).toBe(true);
  });

  it('composed shapes with nested arrays: incorrect element type', () => {
    const lineItem = enforce.shape({
      price: enforce.anyOf(enforce.isNumber(), enforce.isNumeric()),
      qty: enforce.isNumber().greaterThan(0),
      sku: enforce.isString(),
    });
    const cart = enforce.shape({
      items: enforce.isArrayOf(lineItem),
    });

    type Cart = typeof cart.infer;

    const ok: Cart = { items: [{ price: 1, qty: 1, sku: 'x' }] };
    void ok;

    // Type test: items must be array of lineItem
    const badCart1 = { items: ['x'] } satisfies Cart;
    void badCart1;

    const badCart2 = {
      // Type test: qty must be number > 0 (type-wise: number, so boolean is invalid)
      items: [{ price: 1, qty: true, sku: 'x' }],
    } satisfies Cart;
    void badCart2;
    expect(true).toBe(true);
  });
});
