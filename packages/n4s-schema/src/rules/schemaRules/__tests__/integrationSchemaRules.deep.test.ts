import { describe, expect, it } from 'vitest';

import { enforce } from 'n4s-schema';

// schema combinators are consumed via enforce

describe('integration: extensive schema + combinators', () => {
  it('deep object: user profile with addresses, contacts and preferences', () => {
    const Roles = { admin: 'admin', user: 'user', guest: 'guest' } as const;
    const Envs = { dev: 1, prod: 2, stage: 3 } as const;

    const addressSchema = enforce.shape({
      city: enforce.isString().isNotBlank(),
      country: enforce.isString().longerThan(1),
      street: enforce.isString().isNotBlank(),
      // zip can be a numeric string of 5 chars OR a 5-digit number
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

    const contactSchema = enforce.shape({
      // object key/value checks
      metaEnvKey: enforce.isKeyOf(Envs),
      metaRoleValue: enforce.isValueOf(Roles as any),
      // exactly one of email or phone must be present
      method: enforce.oneOf(
        enforce.isString().equals('email'),
        enforce.isString().equals('phone'),
      ),
      // email must be non-blank string; phone must be numeric (string or number) with >= 10 digits/value
      value: enforce.anyOf(
        enforce.allOf(enforce.isString(), enforce.isString().isNotBlank()),
        enforce.allOf(enforce.isNumeric().greaterThanOrEquals(1_000_000_000)),
        enforce.allOf(enforce.isNumber().greaterThanOrEquals(1_000_000_000)),
      ),
    });

    const preferencesSchema = enforce.loose({
      darkMode: enforce.isBoolean(),
      language: enforce.optional(
        enforce.anyOf(
          enforce.isString().inside(['en', 'es', 'he', 'fr']),
          enforce.isString().matches(/^[a-z]{2}$/),
        ),
      ),
      // nested arrays: list of lists of numeric or numeric-string thresholds
      thresholds: enforce.optional(
        enforce.isArrayOf(
          enforce.isArrayOf(
            enforce.isNumeric().greaterThanOrEquals(0),
            enforce.isNumber().greaterThanOrEquals(0),
          ),
        ),
      ),
    });

    const userSchema = enforce.shape({
      addresses: enforce.isArrayOf(addressSchema),
      contacts: enforce.isArrayOf(contactSchema),
      // array that accepts numbers or numeric strings per element
      favoriteNumbers: enforce.isArrayOf(
        enforce.isNumeric(),
        enforce.isNumber(),
      ),
      // accept id as number > 0 OR numeric-string of digits (no leading +, must be > 0)
      id: enforce.anyOf(
        enforce.isNumber().greaterThan(0),
        enforce.allOf(
          enforce.isString(),
          enforce.isString().matches(/^[1-9]\d*$/),
        ),
      ),
      // preferences object may contain more keys than declared (loose)
      preferences: enforce.optional(preferencesSchema),
      username: enforce.allOf(
        enforce.isString().minLength(3),
        enforce.noneOf(
          enforce.isString().equals('admin'),
          enforce.isString().equals('root'),
        ),
      ),
    });

    // (intentionally skipping compile-time type assertion: some rules (e.g., checkKey/checkValue)
    // intentionally widen the inferred type making runtime checks more valuable here)

    // Happy path
    expect(
      userSchema.run({
        addresses: [
          {
            city: 'Star City',
            country: 'US',
            street: '3 Third St',
            zip: '67890',
          },
        ],
        contacts: [
          {
            metaEnvKey: 'dev' as any,
            metaRoleValue: 'user' as any,
            method: 'email',
            value: 'jane@example.com',
          },
          {
            metaEnvKey: 'prod' as any,
            metaRoleValue: 'admin' as any,
            method: 'phone',
            value: 1234567890,
          },
        ],
        preferences: {
          darkMode: false,
          thresholds: [
            [0, '1'],
            ['2', 3],
          ],
        },
        favoriteNumbers: ['1', 2, '3'],
        id: '100',
        username: 'jane_doe',
      }).pass,
    ).toBe(true);

    // Failures
    // - username is forbidden
    expect(
      userSchema.run({
        addresses: [{ city: 'b', country: 'US', street: 'a', zip: '12345' }],
        contacts: [
          {
            metaEnvKey: 'dev' as any,
            metaRoleValue: 'user' as any,
            method: 'email',
            value: 'x',
          },
        ],
        favoriteNumbers: [1],
        id: 1,
        username: 'root',
      } as any).pass,
    ).toBe(false);

    // - contact.method invalid (neither email nor phone)
    expect(
      userSchema.run({
        addresses: [{ city: 'b', country: 'US', street: 'a', zip: '12345' }],
        contacts: [
          {
            metaEnvKey: 'dev' as any,
            metaRoleValue: 'user' as any,
            method: 'sms',
            value: '1234567890',
          },
        ],
        favoriteNumbers: [1],
        id: 2,
        username: 'ok_user',
      } as any).pass,
    ).toBe(false);

    // - addresses exact shape: extra field should fail
    expect(
      userSchema.run({
        addresses: [
          { city: 'b', country: 'US', extra: true, street: 'a', zip: '12345' },
        ],
        contacts: [
          {
            metaEnvKey: 'dev' as any,
            metaRoleValue: 'user' as any,
            method: 'email',
            value: 'x@y',
          },
        ],
        favoriteNumbers: [1],
        id: 3,
        username: 'user3',
      } as any).pass,
    ).toBe(false);

    // - favoriteNumbers: heterogeneous but must be numeric or number
    expect(
      userSchema.run({
        addresses: [{ city: 'b', country: 'US', street: 'a', zip: '12345' }],
        contacts: [
          {
            metaEnvKey: 'dev' as any,
            metaRoleValue: 'user' as any,
            method: 'email',
            value: 'x@y',
          },
        ],
        favoriteNumbers: [1, 'two'],
        id: 4,
        username: 'user4',
      } as any).pass,
    ).toBe(false);
  });

  it('partial nested object with optional children and nested arrays of shapes', () => {
    const itemSchema = enforce.shape({
      price: enforce.anyOf(
        enforce.isNumber(),
        enforce.allOf(
          enforce.isString(),
          enforce.isString().matches(/^\d+(?:\.\d+)?$/),
        ),
      ),
      qty: enforce.isNumber().greaterThan(0),
      sku: enforce.isString().minLength(3),
      tags: enforce.optional(
        enforce.isArrayOf(enforce.isString().isNotBlank()),
      ),
    });

    const orderBase = {
      id: enforce.anyOf(
        enforce.isNumber(),
        enforce.allOf(
          enforce.isString(),
          enforce.isString().matches(/^[+-]?\d+(?:\.\d+)?$/),
        ),
      ),
      items: enforce.isArrayOf(itemSchema),
      shipping: enforce.optional(
        enforce.shape({
          address: enforce.shape({
            line1: enforce.isString().isNotBlank(),
            line2: enforce.optional(enforce.isString()),
            zip: enforce.anyOf(
              enforce.isNumber().isBetween(10000, 99999),
              enforce.isString().matches(/^\d{5}$/),
            ),
          }),
        }),
      ),
      totals: enforce.loose({
        discounts: enforce.optional(
          enforce.isArrayOf(
            enforce.isNumber().greaterThanOrEquals(0),
            enforce.isNumeric().greaterThanOrEquals(0),
          ),
        ),
        subtotal: enforce.isNumber().greaterThanOrEquals(0),
        tax: enforce.isNumber().greaterThanOrEquals(0),
      }),
    } as const;

    const orderSchema = enforce.shape(enforce.partial(orderBase));

    // Valid order with many optional parts missing
    expect(
      orderSchema.run({
        id: '1001',
        items: [
          { sku: 'AAA', qty: 1, price: '9.99' },
          { sku: 'BBB', qty: 2, price: 5 },
        ],
        totals: { discounts: undefined, subtotal: 10, tax: 0.5 },
      }).pass,
    ).toBe(true);

    // Valid order with deep optional shipping
    expect(
      orderSchema.run({
        id: 1002,
        items: [{ price: 3, qty: 3, sku: 'CCC', tags: ['sale', 'new'] }],
        shipping: {
          address: { line1: 'Somewhere', line2: '', zip: '12345' },
        },
        totals: { discounts: ['1', 2, 0], subtotal: 9, tax: 1 },
      }).pass,
    ).toBe(true);

    // Failure: item tag blank, and shipping.zip wrong
    expect(
      orderSchema.run({
        id: 1003,
        items: [{ price: 1, qty: 1, sku: 'DDD', tags: [''] }],
        shipping: {
          address: { line1: 'X', zip: 'ABCDE' },
        },
        totals: { subtotal: 1, tax: 0 },
      } as any).pass,
    ).toBe(false);
  });
});
