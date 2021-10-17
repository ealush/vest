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
});

const suite = vest.create((skipTest: boolean) => {
  vest.skipWhen(skipTest, () => {
    vest.test('username', () => false);
  });
  vest.test('control', () => false);
});
