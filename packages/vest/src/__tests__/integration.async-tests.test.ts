import { TTestSuite } from 'testUtils/TVestMock';
import { describe, it, expect, beforeEach, beforeAll, test, vi } from 'vitest';
import wait from 'wait';

import { TestPromise } from '../testUtils/testPromise';

import { Modes } from 'Modes';
import * as vest from 'vest';

function genSuite() {
  return vest.create(() => {
    vest.mode(Modes.ALL);
    vest.test('field_1', 'field_statement_1', () => false);
    vest.test('field_2', 'field_statement_2', () => {
      vest.enforce(2).equals(3);
    });
    vest.test('field_3', 'field_statement_3', vi.fn());
    vest.test('field_4', 'field_statement_4', () => {
      vest.warn();
      throw new Error();
    });
    vest.test('field_4', 'field_statement_4', () => {
      vest.warn();
    });
    vest.test('field_5', 'field_statement_5', () => false);
    vest.test('field_5', 'field_statement_6', () => false);
    vest.test('field_6', 'async_statement_1', async () => {
      await wait(250);
    });
    vest.test('field_7', () => Promise.reject('async_statement_2'));
  });
}

let suite: TTestSuite;
describe('Stateful behavior', () => {
  let result,
    callback_1 = vi.fn(),
    callback_2 = vi.fn(),
    callback_3 = vi.fn(),
    control = vi.fn();

  beforeEach(() => {
    suite = genSuite();
  });

  beforeAll(() => {
    callback_1 = vi.fn();
    callback_2 = vi.fn();
    callback_3 = vi.fn();
    control = vi.fn();
  });

  test('Should have all fields', () =>
    TestPromise(done => {
      // ❗️Why is this test async? Because of the `resetState` beforeEach.
      // We must not clean up before the suite is actually done.
      result = suite.after(done).run();
      expect(result.tests).toHaveProperty('field_1');
      expect(result.tests).toHaveProperty('field_2');
      expect(result.tests).toHaveProperty('field_4');
      expect(result.tests).toHaveProperty('field_5');
      expect(result.tests).toHaveProperty('field_6');
      expect(result.tests).toHaveProperty('field_7');
      expect(result.hasErrors('field_7')).toBe(false);
      expect(result.tests).toMatchSnapshot();
    }));

  it('Should invoke done callback specified with sync field immediately, and the others after finishing', () =>
    TestPromise(done => {
      result = suite.run();
      result
        .after('field_1', callback_1)
        .after('field_6', callback_2)
        .after(callback_3);
      expect(callback_1).toHaveBeenCalled();
      expect(callback_2).not.toHaveBeenCalled();
      expect(callback_3).not.toHaveBeenCalled();

      setTimeout(() => {
        expect(callback_2).not.toHaveBeenCalled();
        expect(callback_3).not.toHaveBeenCalled();
        expect(suite.get().hasErrors('field_7')).toBe(true);
        control();
      });

      setTimeout(() => {
        expect(callback_2).toHaveBeenCalled();
        expect(callback_3).toHaveBeenCalled();
        expect(control).toHaveBeenCalled();
        done();
      }, 250);
    }));
});
