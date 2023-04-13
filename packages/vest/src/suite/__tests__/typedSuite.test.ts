import { TTestSuiteCallback } from 'testUtils/TVestMock';
import * as vest from 'vest';

type TestFields = 'F1' | 'F2' | 'F3';
type TestGroups = 'G1' | 'G2' | 'G3';

describe('typed suite', () => {
  let suite: vest.Suite<TTestSuiteCallback, TestFields, TestGroups>;

  beforeEach(() => {
    suite = vest.create(() => {});
  });

  it('Should support typed field names and group names', () => {
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

  it('Should only support annotated group and field names in the suite methods', () => {
    const res = suite.get();

    res.hasErrors('F1');
    res.hasErrors('F2');
    res.hasErrors('F3');
    res.hasErrorsByGroup('G1');
    res.hasErrorsByGroup('G1', 'F1');
    res.hasErrorsByGroup('G2', 'F2');
    res.hasWarnings('F3');
    res.hasWarningsByGroup('G2');
    res.hasWarningsByGroup('G3', 'F1');
    res.isValid('F1');
    res.isValidByGroup('G2', 'F1');

    // @ts-expect-error
    res.hasErrors('F5');

    // @ts-expect-error
    res.getErrorsByGroup('G10');

    // @ts-expect-error
    res.hasWarnings('F10');

    suite().done('F1', res => {
      expect(res.tests.F1).toBeUndefined();
      // @ts-expect-error
      expect(res.tests.F14).toBeUndefined();
    });

    // @ts-expect-error
    suite().done('F10', () => {});
  });
});

describe('typed methods', () => {
  it('should run the typed suite normally', () => {
    const suite = vest.create<() => void, 'USERNAME' | 'PASSWORD'>(() => {
      only('PASSWORD');

      test('PASSWORD', 'password is too short', () => false);
    });
    const { test, only } = suite;

    suite();

    expect(suite.get().hasErrors('PASSWORD')).toBe(true);
  });

  test('The suite exposes all typed methods', () => {
    const suite = vest.create(() => {});

    expect(typeof suite.test).toBe('function');
    expect(typeof suite.test.memo).toBe('function');
    expect(typeof suite.only).toBe('function');
    expect(typeof suite.only.group).toBe('function');
    expect(typeof suite.skip).toBe('function');
    expect(typeof suite.skip.group).toBe('function');
    expect(typeof suite.include).toBe('function');
    expect(typeof suite.skipWhen).toBe('function');
    expect(typeof suite.omitWhen).toBe('function');
    expect(typeof suite.optional).toBe('function');
  });
});
