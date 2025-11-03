import { describe, expect, it } from 'vitest';

import { enforceLazy } from 'lazy';

// schema combinators are consumed via enforceLazy

// This suite focuses on compile-time type checks using @ts-expect-error to ensure
// incorrect types produce red squigglies when using the rules and combinators.

describe('types: compile-time mismatches across rules and composed schemas', () => {
  it('primitive rule unions and arrays (number | numeric-string)', () => {
    const arrRule = enforceLazy.isArrayOf(
      enforceLazy.isNumeric(),
      enforceLazy.isNumber(),
    );
    type Arr = typeof arrRule.infer;

    const ok1: Arr = [1, '2', 3];
    void ok1;

    // @ts-expect-error boolean is not allowed in (number | string)[]
    const badArr1: Arr = [true];
    void badArr1;

    // @ts-expect-error object is not allowed in (number | string)[]
    const badArr2: Arr = [{}];
    void badArr2;
    expect(true).toBe(true);
  });

  it('shape: exact fields and correct types', () => {
    const addrSchema = enforceLazy.shape({
      city: enforceLazy.isString(),
      country: enforceLazy.isString(),
      street: enforceLazy.isString(),
      zip: enforceLazy.anyOf(
        enforceLazy.allOf(
          enforceLazy.isString(),
          enforceLazy.isString().matches(/^\d{5}$/),
        ),
        enforceLazy.allOf(
          enforceLazy.isNumber(),
          enforceLazy.isNumber().greaterThanOrEquals(10000),
          enforceLazy.isNumber().lessThanOrEquals(99999),
        ),
      ),
    });

    type Addr = typeof addrSchema.infer;

    const ok: Addr = { city: 'a', country: 'US', street: 'x', zip: '12345' };
    void ok;

    const extra1 = {
      city: 'a',
      country: 'US',
      // @ts-expect-error extra property not allowed by exact shape
      extra: true,
      street: 'x',
      zip: '12345',
    } satisfies Addr;
    void extra1;

    const badZip = {
      city: 'a',
      country: 'US',
      street: 'x',
      // @ts-expect-error boolean is not assignable to string
      zip: true,
    } satisfies Addr;
    void badZip;
    expect(true).toBe(true);
  });

  it('optional + partial: wrong inner types should error', () => {
    const base = {
      count: enforceLazy.isNumber(),
      maybeName: enforceLazy.optional(enforceLazy.isString()),
      totals: enforceLazy.shape({
        subtotal: enforceLazy.isNumber(),
        tax: enforceLazy.isNumber(),
      }),
    } as const;

    const schema = enforceLazy.shape(enforceLazy.partial(base));

    type T = typeof schema.infer;

    const good: T = {
      count: 1,
      totals: { subtotal: 1, tax: 0 },
    };
    void good;

    const badCount = {
      // @ts-expect-error count must be number
      count: '1',
      totals: { subtotal: 1, tax: 0 },
    } satisfies T;
    void badCount;

    const badTotals = {
      count: 1,
      // @ts-expect-error totals.tax must be number
      totals: { subtotal: 1, tax: '0' },
    } satisfies T;
    void badTotals;

    const badMaybe = {
      count: 1,
      // @ts-expect-error maybeName may be string | null | undefined, not boolean
      maybeName: false,
      totals: { subtotal: 1, tax: 0 },
    } satisfies T;
    void badMaybe;
    expect(true).toBe(true);
  });

  it('anyOf/noneOf: union types vs mismatches', () => {
    const strOrNum = enforceLazy.anyOf(
      enforceLazy.isString(),
      enforceLazy.isNumber(),
    );
    type SOrN = typeof strOrNum.infer; // string | number

    const okA: SOrN = 'a';
    const okB: SOrN = 1;
    void okA;
    void okB;

    // @ts-expect-error boolean is not string | number
    const badC: SOrN = true;
    void badC;

    const notString = enforceLazy.noneOf(enforceLazy.isString());
    type NotStr = typeof notString.infer; // string (by design of combinator typing)

    // @ts-expect-error expects string inferred type, assigning number
    const badNotStr: NotStr = 1;
    void badNotStr;
    expect(true).toBe(true);
  });

  it('composed shapes with nested arrays: incorrect element type', () => {
    const lineItem = enforceLazy.shape({
      price: enforceLazy.anyOf(enforceLazy.isNumber(), enforceLazy.isNumeric()),
      qty: enforceLazy.isNumber().greaterThan(0),
      sku: enforceLazy.isString(),
    });
    const cart = enforceLazy.shape({
      items: enforceLazy.isArrayOf(lineItem),
    });

    type Cart = typeof cart.infer;

    const ok: Cart = { items: [{ price: 1, qty: 1, sku: 'x' }] };
    void ok;

    // @ts-expect-error items must be array of lineItem
    const badCart1 = { items: ['x'] } satisfies Cart;
    void badCart1;

    const badCart2 = {
      // @ts-expect-error qty must be number > 0 (type-wise: number, so boolean is invalid)
      items: [{ price: 1, qty: true, sku: 'x' }],
    } satisfies Cart;
    void badCart2;
    expect(true).toBe(true);
  });
});
