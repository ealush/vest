import { enforce } from 'n4s';

import { Modes } from 'Modes';
import * as vest from 'vest';

describe('Stateful behavior', () => {
  let result;
  const validate = genSuite();

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
      SummaryBase {
        "errorCount": 1,
        "errors": [
          "password is required",
        ],
        "testCount": 1,
        "valid": false,
        "warnCount": 0,
        "warnings": [],
      }
    `);
    expect(suite.get()).toMatchSnapshot();

    suite(data, 'confirm');
    expect(suite.get().tests.confirm).toMatchInlineSnapshot(`
      SummaryBase {
        "errorCount": 0,
        "errors": [],
        "testCount": 0,
        "valid": false,
        "warnCount": 0,
        "warnings": [],
      }
    `);
    expect(suite.get()).toMatchSnapshot();
    expect(suite.get().hasErrors('password')).toBe(true);
    expect(suite.get().hasErrors('confirm')).toBe(false);

    data.password = '123456';
    suite(data, 'password');
    expect(suite.get().tests.confirm).toMatchInlineSnapshot(`
      SummaryBase {
        "errorCount": 0,
        "errors": [],
        "testCount": 0,
        "valid": false,
        "warnCount": 0,
        "warnings": [],
      }
    `);
    data.confirm = '123456';
    suite(data, 'confirm');
    expect(suite.get().hasErrors('password')).toBe(false);
    expect(suite.get().hasErrors('confirm')).toBe(false);
    expect(suite.get().tests.confirm).toMatchInlineSnapshot(`
      SummaryBase {
        "errorCount": 0,
        "errors": [],
        "testCount": 1,
        "valid": true,
        "warnCount": 0,
        "warnings": [],
      }
    `);
  });

  const suite = vest.create(
    (data: Record<string, unknown> = {}, only: string) => {
      vest.only(only);

      vest.test('username', 'username is required', () => {
        enforce(data.username).isNotEmpty();
      });

      vest.test('username', 'username must be at least 3 characters', () => {
        enforce(data.username).longerThanOrEquals(3);
      });

      vest.test('password', 'password is required', () => {
        enforce(data.password).isNotEmpty();
      });

      vest.skipWhen(
        draft => draft.hasErrors('password'),
        () => {
          vest.test('confirm', 'passwords do not match', () => {
            enforce(data.confirm).equals(data.password);
          });
        }
      );
    }
  );
});

function genSuite() {
  return vest.create(({ only }: { only?: string | string[] } = {}) => {
    vest.mode(Modes.ALL);
    vest.only(only);
    vest.test('field_1', 'field_statement_1', () => false);
    vest.test('field_2', 'field_statement_2', () => {
      enforce(2).equals(3);
    });
    vest.test('field_3', 'field_statement_3', jest.fn());
    vest.test('field_4', 'field_statement_4', () => {
      vest.warn();
      throw new Error();
    });
    vest.test('field_4', 'field_statement_4', () => {
      vest.warn();
    });
    vest.test('field_5', 'field_statement_5', () => false);
    vest.test('field_5', 'field_statement_6', () => false);
  });
}
