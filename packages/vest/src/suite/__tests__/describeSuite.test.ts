import { describe, expect, it } from 'vitest';

import { describeSuite } from '../../exports/relationships';
import { create, each, enforce, group, include, test } from '../../vest';

const item = { type: 'item', binding: 'isArrayOf' } as const;

describe('describeSuite', () => {
  it('joins schema relationships with the tests and includes of the last run', () => {
    const suite = create(
      (data: { password: string; confirm: string }) => {
        include('confirm').when('password');
        include('terms').when(() => !!data.password);
        test('password', () => true);
        group('signup', () => {
          test('confirm', () => true);
        });
      },
      enforce.shape({
        password: enforce.isString(),
        confirm: enforce.isString().dependsOn($ => $('password')),
        nickname: enforce.isString().dependsOn($ => $('password')),
      }),
    );
    suite.run({ password: 'a', confirm: 'a', nickname: 1 } as never);

    expect(describeSuite(suite)).toEqual({
      relationships: [
        { source: ['password'], target: ['confirm'], effect: 'invalidate' },
        { source: ['password'], target: ['nickname'], effect: 'invalidate' },
      ],
      tests: [
        { fieldName: 'password' },
        { fieldName: 'confirm', groupName: 'signup' },
      ],
      includes: [{ source: 'password', target: 'confirm' }],
      dynamicIncludes: ['terms'],
      untested: [['nickname']],
    });
  });

  it('matches collection members and leaves schema failures out of tests', () => {
    const suite = create(
      (data: { rows: { country: string; state: string }[] }) => {
        data.rows.forEach((_, index) => {
          test(`rows.${index}.state`, () => true);
        });
      },
      enforce.shape({
        rows: enforce.isArrayOf(
          enforce.shape({
            country: enforce.isString(),
            state: enforce.isString().dependsOn($ => $('country')),
          }),
        ),
      }),
    );
    suite.run({ rows: [{ country: 1, state: 'x' }] } as never);

    const description = describeSuite(suite);
    expect(description.tests).toEqual([{ fieldName: 'rows.0.state' }]);
    expect(description.untested).toEqual([]);
    expect(description.relationships).toEqual([
      {
        source: ['rows', item, 'country'],
        target: ['rows', item, 'state'],
        effect: 'invalidate',
      },
    ]);
  });

  it('matches record members and tests registered inside each()', () => {
    const suite = create(
      (data: { prices: Record<string, number> }) => {
        each(Object.keys(data.prices), key => {
          test(`prices.${key}`, () => true, key);
        });
      },
      enforce.shape({
        currency: enforce.isString(),
        prices: enforce.record(
          enforce.isNumber().dependsOn($ => $.root('currency')),
        ),
        total: enforce.isNumber().dependsOn($ => $('currency')),
      }),
    );
    suite.run({ currency: 'USD', prices: { a: 1, b: 2 }, total: 3 });

    const description = describeSuite(suite);
    expect(description.tests).toEqual([
      { fieldName: 'prices.a' },
      { fieldName: 'prices.b' },
    ]);
    // Every record member has a test; total has none.
    expect(description.untested).toEqual([['total']]);
  });

  it('describes a suite without a schema, and before its first run', () => {
    const suite = create(() => {
      include('b').when('a');
      test('a', () => true);
    });
    expect(describeSuite(suite)).toEqual({
      relationships: [],
      tests: [],
      includes: [],
      dynamicIncludes: [],
      untested: [],
    });
    suite.run();
    expect(describeSuite(suite).includes).toEqual([
      { source: 'a', target: 'b' },
    ]);
  });
});
