import { describe, it, expect, beforeEach } from 'vitest';

import * as vest from '../../vest';

type TestFields = 'F1' | 'F2' | 'F3';
type TestGroups = 'G1' | 'G2' | 'G3';

describe('typed suite', () => {
  let suite: vest.Suite<TestFields, TestGroups>;

  beforeEach(() => {
    suite = vest.create<TestFields, TestGroups>(() => {}) as vest.Suite<
      TestFields,
      TestGroups
    >;
  });

  it('should support typed field names and group names', () => {
    const result = suite.get();
    // Checking that TS doesn't hiccup
    expect(result.tests.F1).toBeUndefined();
    expect(result.tests.F2).toBeUndefined();
    expect(result.tests.F3).toBeUndefined();
    expect(result.groups.G1?.F1).toBeUndefined();
    expect(result.groups.G1?.F2).toBeUndefined();
    expect(result.groups.G1?.F3).toBeUndefined();
    expect(result.groups.G2?.F1).toBeUndefined();
    expect(result.groups.G2?.F2).toBeUndefined();
    expect(result.groups.G2?.F3).toBeUndefined();
    expect(result.groups.G3?.F1).toBeUndefined();
    expect(result.groups.G3?.F2).toBeUndefined();
    expect(result.groups.G3?.F3).toBeUndefined();

    // @ts-expect-error - Checking invalid combos
    expect(result.tests.F100).toBeUndefined();
    // @ts-expect-error - Checking invalid combos
    expect(result.groups.G100?.F1).toBeUndefined();
  });

  // eslint-disable-next-line vitest/expect-expect
  it('should type focus group modifiers based on suite group generics', () => {
    suite.focus({ onlyGroup: 'G1', skipGroup: ['G2'] }).run();

    // @ts-expect-error - invalid group name
    suite.focus({ onlyGroup: 'G100' }).run();

    // @ts-expect-error - invalid group name in skip list
    suite.focus({ skipGroup: ['G1', 'G100'] }).run();
  });
  it('should only support annotated group and field names in the suite methods', () => {
    const res: vest.SuiteResult<TestFields, TestGroups> = suite.get();

    res.hasErrors('F1');
    res.hasErrors('F2');
    res.hasErrors('F3');
    res.hasErrorsByGroup('G1');
    res.hasErrorsByGroup('G1', 'F1');
    res.hasErrorsByGroup('G2', 'F2');
    res.hasWarnings('F3');
    res.hasWarningsByGroup('G2');
    res.hasWarningsByGroup('G3', 'F1');
    res.hasSuccesses('F1');
    res.hasSuccessesByGroup('G2');
    res.hasSuccessesByGroup('G3', 'F1');
    res.isValid('F1');

    // @ts-expect-error
    res.hasErrors('F5');

    // @ts-expect-error
    res.getErrorsByGroup('G10');

    // @ts-expect-error
    res.hasWarnings('F10');

    suite
      .afterEach(() => {
        expect(suite.get().tests.F1).toBeUndefined();
        // @ts-expect-error
        expect(suite.get().tests.F14).toBeUndefined();
      })
      .run();

    suite.afterEach(() => {}).run();
  });
});

describe('typed methods', () => {
  it('should run the typed suite normally', () => {
    const suite = vest.create<'USERNAME' | 'PASSWORD'>(() => {
      only('PASSWORD');

      test('PASSWORD', 'password is too short', () => false);
    });
    const { test, only } = suite;

    suite.run();

    expect(suite.get().hasErrors('PASSWORD')).toBe(true);
  });

  it('should expose all typed methods', () => {
    const suite = vest.create(() => {});

    expect(typeof suite.test).toBe('function');
    expect(typeof suite.test).toBe('function');
    expect(typeof suite.only).toBe('function');
    expect(typeof suite.skip).toBe('function');
    expect(typeof suite.include).toBe('function');
    expect(typeof suite.skipWhen).toBe('function');
    expect(typeof suite.omitWhen).toBe('function');
    expect(typeof suite.optional).toBe('function');
  });
});
