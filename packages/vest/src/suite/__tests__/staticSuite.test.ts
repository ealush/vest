import * as vest from 'vest';
import { staticSuite } from 'vest';

describe('staticSuite', () => {
  it('Should return a function', () => {
    expect(typeof staticSuite(() => {})).toBe('function');
  });

  it('Should return a "suite instance"', () => {
    const suite = staticSuite(() => {});
    const result = suite();
    expect(typeof result).toBe('object');
    expect(typeof result.tests).toBe('object');
    expect(typeof result.groups).toBe('object');
    expect(typeof result.warnCount).toBe('number');
    expect(typeof result.errorCount).toBe('number');
    expect(typeof result.testCount).toBe('number');
    expect(typeof result.getWarning).toBe('function');
    expect(typeof result.getError).toBe('function');
    expect(typeof result.getErrors).toBe('function');
    expect(typeof result.getErrors).toBe('function');
    expect(typeof result.getWarnings).toBe('function');
    expect(typeof result.getWarnings).toBe('function');
    expect(typeof result.getErrorsByGroup).toBe('function');
    expect(typeof result.getErrorsByGroup).toBe('function');
    expect(typeof result.getWarningsByGroup).toBe('function');
    expect(typeof result.getWarningsByGroup).toBe('function');
    expect(typeof result.hasErrors).toBe('function');
    expect(typeof result.hasWarnings).toBe('function');
    expect(typeof result.hasErrorsByGroup).toBe('function');
    expect(typeof result.hasWarningsByGroup).toBe('function');
    expect(typeof result.isValid).toBe('function');
    expect(typeof result.isValidByGroup).toBe('function');
    expect(typeof result.done).toBe('function');
  });

  it('On consecutive calls, should return a new "suite instance"', () => {
    const suite = staticSuite(only => {
      vest.only(only);
      vest.test('t1', () => false);
      vest.test('t2', () => false);
    });

    const res1 = suite('t1');
    const res2 = suite('t2');

    expect(res1).not.toBe(res2);
    expect(res1.hasErrors('t1')).toBe(true);
    expect(res1.hasErrors('t2')).toBe(false);
    expect(res2.hasErrors('t1')).toBe(false);
    expect(res2.hasErrors('t2')).toBe(true);
  });

  it('Should run async tests normally', () => {
    const suite = staticSuite(() => {
      vest.test('t1', async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
        throw new Error();
      });
    });
    return new Promise<void>(resolve => {
      const res = suite();

      expect(res.hasErrors('t1')).toBe(false);

      res.done(() => {
        resolve();
      });
    });
  });
});
