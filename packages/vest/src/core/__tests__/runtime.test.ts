import * as vest from 'vest';

describe('useLoadSuite', () => {
  it('Calling useLoadSuite should resume from loaded state', () => {
    const suite = vest.create(() => {
      vest.test('some_test', () => {});
    });
    const res = suite();
    expect(suite.isValid()).toBe(true);
    expect(res.testCount).toBe(1);
    expect(res.errorCount).toBe(0);
    expect(res.warnCount).toBe(0);
    expect(suite.hasErrors('some_test')).toBe(false);
    expect(suite.hasWarnings('some_test')).toBe(false);
    expect(suite.hasErrors()).toBe(false);
    expect(suite.hasWarnings()).toBe(false);
    expect(suite.getErrors()).toEqual({});

    const dump = genDump();

    expect(dump).toMatchSnapshot();

    suite.resume(dump);

    expect(res).not.toEqual(suite.get());
    expect(suite.isValid()).toBe(false);
    const loadedRes = suite.get();
    expect(loadedRes.testCount).toBe(6);
    expect(loadedRes.errorCount).toBe(4);
    expect(loadedRes.warnCount).toBe(1);
    expect(suite.hasErrors('t1')).toBe(true);
    expect(suite.hasErrors('t2')).toBe(true);
    expect(suite.hasErrors('t3')).toBe(false);
    expect(suite.hasErrors('t4')).toBe(false);
    expect(suite.hasErrors('t5')).toBe(false);
    expect(suite.hasErrors('t6')).toBe(true);
    expect(suite.hasWarnings('t1')).toBe(false);
    expect(suite.hasWarnings('t2')).toBe(false);
    expect(suite.hasWarnings('t3')).toBe(false);
    expect(suite.hasWarnings('t4')).toBe(true);
    expect(suite.hasWarnings('t5')).toBe(false);
    expect(suite.hasWarnings('t6')).toBe(false);
    expect(suite.hasErrors()).toBe(true);
    expect(suite.hasWarnings()).toBe(true);
    expect(suite.getErrors()).toEqual({
      t1: [],
      t2: ['t2 message'],
      t6: [],
    });
    expect(suite.hasErrorsByGroup('g1')).toBe(true);
    expect(suite.hasErrorsByGroup('g1', 't1')).toBe(false);
    expect(suite.hasErrorsByGroup('g1', 't2')).toBe(true);
    expect(suite.hasErrorsByGroup('g1', 't3')).toBe(false);
    expect(suite.hasErrorsByGroup('g1', 't4')).toBe(false);
    expect(suite.hasErrorsByGroup('g2')).toBe(false);
    expect(suite.hasErrorsByGroup('g2', 't1')).toBe(false);
    expect(suite.hasErrorsByGroup('g2', 't2')).toBe(false);
    expect(suite.hasErrorsByGroup('g2', 't3')).toBe(false);
    expect(suite.hasErrorsByGroup('g1', 't4')).toBe(false);
    expect(suite.hasWarningsByGroup('g1', 't4')).toBe(true);

    expect(suite.get()).toMatchSnapshot();
  });
});

function genDump() {
  const suite = vest.create(() => {
    vest.skip('t5');

    vest.test('t1', () => false);
    vest.group('g1', () => {
      vest.test('t2', 't2 message', () => false);
      vest.test('t3', () => {});
      vest.test('t4', () => {
        vest.warn();
        return false;
      });
    });
    vest.test('t5', () => false);
    vest.each(['a', 'b'], key => {
      vest.test('t6', () => false, key);
    });
  });

  suite();

  return suite.dump();
}
