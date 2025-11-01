import { describe, expect, it } from 'vitest';

import { enforceLazy } from 'lazy';

// schema combinators are consumed via enforceLazy

describe('integration: extensive schema + combinators', () => {
  it('deep object: user profile with addresses, contacts and preferences', () => {
    const Roles = { admin: 'admin', user: 'user', guest: 'guest' } as const;
    const Envs = { dev: 1, prod: 2, stage: 3 } as const;

    const addressSchema = enforceLazy.shape({
      city: enforceLazy.isString().isNotBlank(),
      country: enforceLazy.isString().longerThan(1),
      street: enforceLazy.isString().isNotBlank(),
      // zip can be a numeric string of 5 chars OR a 5-digit number
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

    const contactSchema = enforceLazy.shape({
      // object key/value checks
      metaEnvKey: enforceLazy.checkKey().isKeyOf(Envs),
      metaRoleValue: enforceLazy.checkValue<string>().isValueOf(Roles as any),
      // exactly one of email or phone must be present
      method: enforceLazy.oneOf(
        enforceLazy.isString().equals('email'),
        enforceLazy.isString().equals('phone'),
      ),
      // email must be non-blank string; phone must be numeric (string or number) with >= 10 digits/value
      value: enforceLazy.anyOf(
        enforceLazy.allOf(
          enforceLazy.isString(),
          enforceLazy.isString().isNotBlank(),
        ),
        enforceLazy.allOf(
          enforceLazy.isNumeric().greaterThanOrEquals(1_000_000_000),
        ),
        enforceLazy.allOf(
          enforceLazy.isNumber().greaterThanOrEquals(1_000_000_000),
        ),
      ),
    });

    const preferencesSchema = enforceLazy.loose({
      darkMode: enforceLazy.isBoolean(),
      language: enforceLazy.optional(
        enforceLazy.anyOf(
          enforceLazy.isString().inside(['en', 'es', 'he', 'fr']),
          enforceLazy.isString().matches(/^[a-z]{2}$/),
        ),
      ),
      // nested arrays: list of lists of numeric or numeric-string thresholds
      thresholds: enforceLazy.optional(
        enforceLazy.isArrayOf(
          enforceLazy.isArrayOf(
            enforceLazy.isNumeric().greaterThanOrEquals(0),
            enforceLazy.isNumber().greaterThanOrEquals(0),
          ),
        ),
      ),
    });

    const userSchema = enforceLazy.shape({
      addresses: enforceLazy.isArrayOf(addressSchema),
      contacts: enforceLazy.isArrayOf(contactSchema),
      // array that accepts numbers or numeric strings per element
      favoriteNumbers: enforceLazy.isArrayOf(
        enforceLazy.isNumeric(),
        enforceLazy.isNumber(),
      ),
      // accept id as number > 0 OR numeric-string of digits (no leading +, must be > 0)
      id: enforceLazy.anyOf(
        enforceLazy.isNumber().greaterThan(0),
        enforceLazy.allOf(
          enforceLazy.isString(),
          enforceLazy.isString().matches(/^[1-9]\d*$/),
        ),
      ),
      // preferences object may contain more keys than declared (loose)
      preferences: enforceLazy.optional(preferencesSchema),
      username: enforceLazy.allOf(
        enforceLazy.isString().minLength(3),
        enforceLazy.noneOf(
          enforceLazy.isString().equals('admin'),
          enforceLazy.isString().equals('root'),
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
      }).passes,
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
      } as any).passes,
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
      } as any).passes,
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
      } as any).passes,
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
      } as any).passes,
    ).toBe(false);
  });

  it('partial nested object with optional children and nested arrays of shapes', () => {
    const itemSchema = enforceLazy.shape({
      price: enforceLazy.anyOf(
        enforceLazy.isNumber(),
        enforceLazy.allOf(
          enforceLazy.isString(),
          enforceLazy.isString().matches(/^\d+(?:\.\d+)?$/),
        ),
      ),
      qty: enforceLazy.isNumber().greaterThan(0),
      sku: enforceLazy.isString().minLength(3),
      tags: enforceLazy.optional(
        enforceLazy.isArrayOf(enforceLazy.isString().isNotBlank()),
      ),
    });

    const orderBase = {
      id: enforceLazy.anyOf(
        enforceLazy.isNumber(),
        enforceLazy.allOf(
          enforceLazy.isString(),
          enforceLazy.isString().matches(/^[+-]?\d+(?:\.\d+)?$/),
        ),
      ),
      items: enforceLazy.isArrayOf(itemSchema),
      shipping: enforceLazy.optional(
        enforceLazy.shape({
          address: enforceLazy.shape({
            line1: enforceLazy.isString().isNotBlank(),
            line2: enforceLazy.optional(enforceLazy.isString()),
            zip: enforceLazy.anyOf(
              enforceLazy.isNumber().isBetween(10000, 99999),
              enforceLazy.isString().matches(/^\d{5}$/),
            ),
          }),
        }),
      ),
      totals: enforceLazy.loose({
        discounts: enforceLazy.optional(
          enforceLazy.isArrayOf(
            enforceLazy.isNumber().greaterThanOrEquals(0),
            enforceLazy.isNumeric().greaterThanOrEquals(0),
          ),
        ),
        subtotal: enforceLazy.isNumber().greaterThanOrEquals(0),
        tax: enforceLazy.isNumber().greaterThanOrEquals(0),
      }),
    } as const;

    const orderSchema = enforceLazy.shape(enforceLazy.partial(orderBase));

    // Valid order with many optional parts missing
    expect(
      orderSchema.run({
        id: '1001',
        items: [
          { sku: 'AAA', qty: 1, price: '9.99' },
          { sku: 'BBB', qty: 2, price: 5 },
        ],
        totals: { discounts: undefined, subtotal: 10, tax: 0.5 },
      }).passes,
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
      }).passes,
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
      } as any).passes,
    ).toBe(false);
  });
});
