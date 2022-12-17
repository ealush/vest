import { dummyTest } from '../../../testUtils/testDummy';

import * as vest from 'vest';

describe('skipWhen', () => {
  let fn = jest.fn();
  beforeEach(() => {
    fn = jest.fn();
    suite.reset();
  });
  it('Should run callback both when condition is true or false', () => {
    let counter = 0;
    const suite = vest.create(() => {
      vest.skipWhen(counter === 1, fn);

      counter++;
    });
    expect(fn).toHaveBeenCalledTimes(0);
    suite();
    expect(fn).toHaveBeenCalledTimes(1);
    suite();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('Should respect both boolean and function conditions', () => {
    const suite = vest.create(() => {
      vest.skipWhen(false, fn);
      vest.skipWhen(true, fn);
      vest.skipWhen(() => false, fn);
      vest.skipWhen(() => true, fn);
    });

    suite();

    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('Should pass result draft to the functional condition', () => {
    const f = jest.fn();
    const control = jest.fn();

    vest.create(() => {
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
    })();

    expect(control).toHaveBeenCalledTimes(3);
  });

  it('Should skip tests when the condition is truthy', () => {
    const res = suite(true);
    expect(res.tests.username.testCount).toBe(0);
  });

  it('Should run tests when the condition is falsy', () => {
    const res = suite(false);
    expect(res.tests.username.testCount).toBe(1);
  });

  it('Should correctly refill the state when field is skipped', () => {
    const res = suite(false);
    expect(res.tests.username.testCount).toBe(1);
    suite(true);

    expect(suite.get().tests.username.testCount).toBe(1);
  });

  describe('nested calls', () => {
    let suite: vest.Suite<() => void>;

    describe('skipped in non-skipped', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.skipWhen(false, () => {
            vest.test('outer', () => false);

            vest.skipWhen(true, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite();
      });
      it('Should run `outer` and skip `inner`', () => {
        expect(suite.get().testCount).toBe(1);
        expect(suite.get().hasErrors('outer')).toBe(true);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });

    describe('skipped in skipped', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.skipWhen(true, () => {
            vest.test('outer', () => false);

            vest.skipWhen(true, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite();
      });
      it('Should skip both `outer` and `inner`', () => {
        expect(suite.get().testCount).toBe(0);
        expect(suite.get().hasErrors('outer')).toBe(false);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });
    describe('non-skipped in skipped', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.skipWhen(true, () => {
            vest.test('outer', () => false);

            vest.skipWhen(false, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite();
      });
      it('Should skip both', () => {
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
