import { describe, expect, it } from 'vitest';

import { enforce } from '../../../n4s';

// schema combinators are consumed via enforce

describe('integration: extensive schema + combinators', () => {
  it('deep object: user profile with addresses, contacts and preferences', () => {
    const Roles = { admin: 'admin', user: 'user', guest: 'guest' } as const;
    const Envs = { dev: 1, prod: 2, stage: 3 } as const;

    const addressSchema = enforce.shape({
      city: enforce.isString().isNotBlank(),
      country: enforce.isString().longerThan(1),
      street: enforce.isString().isNotBlank(),
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
      metaEnvKey: enforce.isKeyOf(Envs),
      metaRoleValue: enforce.isValueOf(Roles as Record<string, string>),
      method: enforce.oneOf(
        enforce.isString().equals('email'),
        enforce.isString().equals('phone'),
      ),
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
      favoriteNumbers: enforce.isArrayOf(
        enforce.isNumeric(),
        enforce.isNumber(),
      ),
      id: enforce.anyOf(
        enforce.isNumber().greaterThan(0),
        enforce.allOf(
          enforce.isString(),
          enforce.isString().matches(/^[1-9]\d*$/),
        ),
      ),
      preferences: enforce.optional(preferencesSchema),
      username: enforce.allOf(
        enforce.isString().minLength(3),
        enforce.noneOf(
          enforce.isString().equals('admin'),
          enforce.isString().equals('root'),
        ),
      ),
    });

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
            metaEnvKey: 'dev',
            metaRoleValue: 'user',
            method: 'email',
            value: 'jane@example.com',
          },
          {
            metaEnvKey: 'prod',
            metaRoleValue: 'admin',
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

    expect(
      userSchema.run({
        addresses: [{ city: 'b', country: 'US', street: 'a', zip: '12345' }],
        contacts: [
          {
            metaEnvKey: 'dev',
            metaRoleValue: 'user',
            method: 'email',
            value: 'x',
          },
        ],
        favoriteNumbers: [1],
        id: 1,
        username: 'root',
      }).pass,
    ).toBe(false);

    expect(
      userSchema.run({
        addresses: [{ city: 'b', country: 'US', street: 'a', zip: '12345' }],
        contacts: [
          {
            metaEnvKey: 'dev',
            metaRoleValue: 'user',
            method: 'sms',
            value: '1234567890',
          },
        ],
        favoriteNumbers: [1],
        id: 2,
        username: 'ok_user',
      }).pass,
    ).toBe(false);

    expect(
      userSchema.run({
        addresses: [
          {
            city: 'b',
            country: 'US',
            // @ts-expect-error - extra field not in strict shape
            extra: true,
            street: 'a',
            zip: '12345',
          },
        ],
        contacts: [
          {
            metaEnvKey: 'dev',
            metaRoleValue: 'user',
            method: 'email',
            value: 'x@y',
          },
        ],
        favoriteNumbers: [1],
        id: 3,
        username: 'user3',
      }).pass,
    ).toBe(false);

    expect(
      userSchema.run({
        addresses: [{ city: 'b', country: 'US', street: 'a', zip: '12345' }],
        contacts: [
          {
            metaEnvKey: 'dev',
            metaRoleValue: 'user',
            method: 'email',
            value: 'x@y',
          },
        ],
        favoriteNumbers: [1, 'two'],
        id: 4,
        username: 'user4',
      }).pass,
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

    const orderSchema = enforce.partial(orderBase);

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

    expect(
      orderSchema.run({
        id: 1002,
        items: [{ price: 3, qty: 3, sku: 'CCC', tags: ['sale', 'new'] }],
        shipping: { address: { line1: 'Somewhere', line2: '', zip: '12345' } },
        totals: { discounts: ['1', 2, 0], subtotal: 9, tax: 1 },
      }).pass,
    ).toBe(true);

    expect(
      orderSchema.run({
        id: 1003,
        items: [{ price: 1, qty: 1, sku: 'DDD', tags: [''] }],
        shipping: { address: { line1: 'X', zip: 'ABCDE' } },
        totals: { subtotal: 1, tax: 0 },
      }).pass,
    ).toBe(false);
  });
});
