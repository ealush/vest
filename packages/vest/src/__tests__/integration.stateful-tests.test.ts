import { enforce } from 'enforce';

import * as vest from 'vest';

describe('Stateful behavior', () => {
  let result;
  const validate = genValidate(vest);

  test('Should merge skipped fields with previous values', () => {
    result = validate({ only: 'field_1' });
    expect(result.tests.field_1.errorCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(Object.keys(result.tests)).toHaveLength(5); // including 4 skipped tests
    expect(result.tests).toHaveProperty('field_1');
    expect(result).toMatchSnapshot();

    result = validate({ only: 'field_5' });
    expect(result.errorCount).toBe(3);
    expect(result.tests.field_1.errorCount).toBe(1);
    expect(result.tests.field_5.errorCount).toBe(2);
    expect(Object.keys(result.tests)).toHaveLength(5); // including 4 skipped tests
    expect(result.tests).toHaveProperty('field_1');
    expect(result.tests).toHaveProperty('field_5');
    expect(result).toMatchSnapshot();

    result = validate();
    expect(result.errorCount).toBe(4);
    expect(result.tests.field_1.errorCount).toBe(1);
    expect(result.tests.field_2.errorCount).toBe(1);
    expect(result.tests.field_4.warnCount).toBe(1);
    expect(result.tests.field_5.errorCount).toBe(2);
    expect(Object.keys(result.tests)).toHaveLength(5);
    expect(result).toMatchSnapshot();
  });
});

describe('more complex', () => {
  const { test, enforce, create, skipWhen } = vest;

  const data: Record<string, string> = {};

  it('Should run correctly', () => {
    expect(suite.get().hasErrors()).toBe(false);
    expect(suite.get()).toMatchSnapshot();

    data.username = 'user_1';
    suite(data, 'username');

    expect(suite.get().hasErrors()).toBe(false);
    expect(suite.get()).toMatchSnapshot();

    suite(data, 'password');
    expect(suite.get().hasErrors()).toBe(true);
    expect(suite.get().tests.password).toMatchInlineSnapshot(`
      Object {
        "errorCount": 1,
        "errors": Array [
          "password is required",
        ],
        "testCount": 1,
        "warnCount": 0,
      }
    `);
    expect(suite.get()).toMatchSnapshot();

    suite(data, 'confirm');
    expect(suite.get().tests.confirm).toMatchInlineSnapshot(`
      Object {
        "errorCount": 0,
        "testCount": 0,
        "warnCount": 0,
      }
    `);
    expect(suite.get()).toMatchSnapshot();
    expect(suite.get().hasErrors('password')).toBe(true);
    expect(suite.get().hasErrors('confirm')).toBe(false);

    data.password = '123456';
    suite(data, 'password');
    expect(suite.get().tests.confirm).toMatchInlineSnapshot(`
      Object {
        "errorCount": 0,
        "testCount": 0,
        "warnCount": 0,
      }
    `);
    data.confirm = '123456';
    suite(data, 'confirm');
    expect(suite.get().hasErrors('password')).toBe(false);
    expect(suite.get().hasErrors('confirm')).toBe(false);
    expect(suite.get().tests.confirm).toMatchInlineSnapshot(`
      Object {
        "errorCount": 0,
        "testCount": 1,
        "warnCount": 0,
      }
    `);
  });

  const suite = create((data: Record<string, unknown> = {}, only: string) => {
    vest.only(only);

    test('username', 'username is required', () => {
      enforce(data.username).isNotEmpty();
    });

    test('username', 'username must be at least 3 characters', () => {
      enforce(data.username).longerThanOrEquals(3);
    });

    test('password', 'password is required', () => {
      enforce(data.password).isNotEmpty();
    });

    skipWhen(
      draft => draft.hasErrors('password'),
      () => {
        test('confirm', 'passwords do not match', () => {
          enforce(data.confirm).equals(data.password);
        });
      }
    );
  });
});

function genValidate({ create, test, ...vest }) {
  return create(({ only }: { only?: string | string[] } = {}) => {
    vest.only(only);
    test('field_1', 'field_statement_1', () => false);
    test('field_2', 'field_statement_2', () => {
      enforce(2).equals(3);
    });
    test('field_3', 'field_statement_3', jest.fn());
    test('field_4', 'field_statement_4', () => {
      vest.warn();
      throw new Error();
    });
    test('field_4', 'field_statement_4', () => {
      vest.warn();
    });
    test('field_5', 'field_statement_5', () => false);
    test('field_5', 'field_statement_6', () => false);
  });
}
