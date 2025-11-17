import { describe, it, expect, beforeEach, vi } from 'vitest';

import { dummyTest } from '../../testUtils/testDummy';

import { TTestSuite } from '../../testUtils/TVestMock';
import * as vest from '../../vest';

describe('skipWhen', () => {
  let fn = vi.fn();
  beforeEach(() => {
    fn = vi.fn();
    suite.reset();
  });
  it('should run the callback whether condition is true or false', () => {
    let counter = 0;
    const suite = vest.create(() => {
      vest.skipWhen(counter === 1, fn);

      counter++;
    });
    expect(fn).toHaveBeenCalledTimes(0);
    suite.run();
    expect(fn).toHaveBeenCalledTimes(1);
    suite.run();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should accept both boolean and function conditions', () => {
    const suite = vest.create(() => {
      vest.skipWhen(false, fn);
      vest.skipWhen(true, fn);
      vest.skipWhen(() => false, fn);
      vest.skipWhen(() => true, fn);
    });

    suite.run();

    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('should pass the current result draft to the functional condition', () => {
    const f = vi.fn();
    const control = vi.fn();

    vest
      .create(() => {
        vest.skipWhen(draft => {
          expect(draft.hasErrors()).toBe(false);
          expect(draft).toMatchSnapshot();
          control();
          return false;
        }, f);
        dummyTest.failing('f1', 'msg');
        vest.skipWhen(draft => {
          expect(draft.hasErrors()).toBe(true);
          expect(draft.hasErrors('f1')).toBe(true);
          expect(draft.hasErrors('f2')).toBe(false);
          expect(draft.hasErrors('f3')).toBe(false);
          expect(draft).toMatchSnapshot();
          control();
          return false;
        }, f);
        dummyTest.failing('f2', 'msg');
        vest.skipWhen(draft => {
          expect(draft.hasErrors()).toBe(true);
          expect(draft.hasErrors('f1')).toBe(true);
          expect(draft.hasErrors('f2')).toBe(true);
          expect(draft.hasErrors('f3')).toBe(false);
          expect(draft).toMatchSnapshot();
          control();
          return false;
        }, f);
        dummyTest.failing('f3', 'msg');
      })
      .run();

    expect(control).toHaveBeenCalledTimes(3);
  });

  it('should skip tests when the condition is truthy', () => {
    const res = suite.run(true);
    expect(res.tests.username.testCount).toBe(0);
  });

  it('should run tests when the condition is falsy', () => {
    const res = suite.run(false);
    expect(res.tests.username.testCount).toBe(1);
  });

  it('should keep previous test state when field is later skipped', () => {
    const res = suite.run(false);
    expect(res.tests.username.testCount).toBe(1);
    suite.run(true);

    expect(suite.get().tests.username.testCount).toBe(1);
  });

  describe('nested calls', () => {
    let suite: TTestSuite;

    describe('skipped inside non-skipped', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.skipWhen(false, () => {
            vest.test('outer', () => false);

            vest.skipWhen(true, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite.run();
      });
      it('should run outer and skip inner', () => {
        expect(suite.get().testCount).toBe(1);
        expect(suite.get().hasErrors('outer')).toBe(true);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });

    describe('skipped inside skipped', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.skipWhen(true, () => {
            vest.test('outer', () => false);

            vest.skipWhen(true, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite.run();
      });
      it('should skip both outer and inner', () => {
        expect(suite.get().testCount).toBe(0);
        expect(suite.get().hasErrors('outer')).toBe(false);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });
    describe('non-skipped inside skipped', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.skipWhen(true, () => {
            vest.test('outer', () => false);

            vest.skipWhen(false, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite.run();
      });
      it('should skip both outer and inner tests', () => {
        expect(suite.get().testCount).toBe(0);
        expect(suite.get().hasErrors('outer')).toBe(false);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });
  });
});

const suite = vest.create((skipTest: boolean) => {
  vest.skipWhen(skipTest, () => {
    vest.test('username', () => false);
  });
  vest.test('control', () => false);
});
