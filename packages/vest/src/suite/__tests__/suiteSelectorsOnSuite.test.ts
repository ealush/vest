import { TTestSuite } from 'testUtils/TVestMock';
import * as vest from 'vest';

describe('Suite Selectors on Suite', () => {
  let suite: TTestSuite;

  beforeEach(() => {
    suite = vest.create('suite_name', () => {
      // failing
      vest.test('f1', 'f1_message', () => false);
      // passing
      vest.test('f2', 'f2_message', () => {});
      // warning
      vest.test('f3', 'f3_message', () => {
        vest.warn();
        return false;
      });

      // f1 passing
      vest.test('f1', 'f1_message_2', () => {});

      vest.group('g1', () => {
        vest.test('f4', 'f4_message_1', () => false);
      });
    });
  });

  test('All `get` functions exist on the suite', () => {
    const res = suite.get();
    const keys = Object.keys(res);
    let count = 0;
    keys.forEach(key => {
      // @ts-ignore
      if (typeof res[key] === 'function') {
        // @ts-ignore
        // eslint-disable-next-line jest/no-conditional-expect
        expect(typeof suite[key]).toBe('function');
        count++;
      }
    });
    expect(count).toBeGreaterThan(0);
  });
  test('All suite selectors return the same value', () => {
    const res = suite.get();
    const keys = Object.keys(res);
    let count = 0;
    keys.forEach(key => {
      // @ts-ignore
      if (typeof res[key] === 'function') {
        // @ts-ignore
        // eslint-disable-next-line jest/no-conditional-expect
        expect(suite[key]()).toEqual(res[key]());
        count++;
      }
    });
    expect(count).toBeGreaterThan(0);
  });

  test('sample', () => {
    const res = suite.get();

    expect(res.getErrors()).toEqual(suite.getErrors());
    expect(res.getErrors('f1')).toEqual(suite.getErrors('f1'));
    expect(res.getErrors('f2')).toEqual(suite.getErrors('f2'));
    expect(res.getErrors('f3')).toEqual(suite.getErrors('f3'));
    expect(res.getErrors('f4')).toEqual(suite.getErrors('f4'));
    expect(res.hasErrors('f1')).toEqual(suite.hasErrors('f1'));
    expect(res.hasErrors('f2')).toEqual(suite.hasErrors('f2'));
    expect(res.hasErrors('f3')).toEqual(suite.hasErrors('f3'));
    expect(res.hasErrors('f4')).toEqual(suite.hasErrors('f4'));
    expect(res.getWarnings()).toEqual(suite.getWarnings());
    expect(res.getWarnings('f1')).toEqual(suite.getWarnings('f1'));
    expect(res.getWarnings('f2')).toEqual(suite.getWarnings('f2'));
    expect(res.getWarnings('f3')).toEqual(suite.getWarnings('f3'));
    expect(res.getWarnings('f4')).toEqual(suite.getWarnings('f4'));
    expect(res.hasWarnings('f1')).toEqual(suite.hasWarnings('f1'));
    expect(res.hasWarnings('f2')).toEqual(suite.hasWarnings('f2'));
    expect(res.hasWarnings('f3')).toEqual(suite.hasWarnings('f3'));
    expect(res.hasWarnings('f4')).toEqual(suite.hasWarnings('f4'));
    expect(res.hasErrorsByGroup('g1')).toEqual(suite.hasErrorsByGroup('g1'));
    expect(res.hasErrorsByGroup('g1', 'f1')).toEqual(
      suite.hasErrorsByGroup('g1', 'f1')
    );
    expect(res.hasErrorsByGroup('g1', 'f2')).toEqual(
      suite.hasErrorsByGroup('g1', 'f2')
    );
    expect(res.hasErrorsByGroup('g1', 'f3')).toEqual(
      suite.hasErrorsByGroup('g1', 'f3')
    );
    expect(res.hasErrorsByGroup('g1', 'f4')).toEqual(
      suite.hasErrorsByGroup('g1', 'f4')
    );
    expect(res.getErrorsByGroup('g1')).toEqual(suite.getErrorsByGroup('g1'));
    expect(res.getErrorsByGroup('g1, f1')).toEqual(
      suite.getErrorsByGroup('g1, f1')
    );
    expect(res.getErrorsByGroup('g1, f2')).toEqual(
      suite.getErrorsByGroup('g1, f2')
    );
    expect(res.getErrorsByGroup('g1, f3')).toEqual(
      suite.getErrorsByGroup('g1, f3')
    );
    expect(res.getErrorsByGroup('g1, f4')).toEqual(
      suite.getErrorsByGroup('g1, f4')
    );
    expect(res.isValid()).toEqual(suite.isValid());
    expect(res.isValid('f1')).toEqual(suite.isValid('f1'));
    expect(res.isValid('f2')).toEqual(suite.isValid('f2'));
    expect(res.isValid('f3')).toEqual(suite.isValid('f3'));
    expect(res.isValid('f4')).toEqual(suite.isValid('f4'));
    expect(res.isValidByGroup('g1')).toEqual(suite.isValidByGroup('g1'));
  });
});
