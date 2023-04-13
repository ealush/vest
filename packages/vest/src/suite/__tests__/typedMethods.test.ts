import * as vest from 'vest';

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
    expect(typeof suite.skip).toBe('function');
    expect(typeof suite.include).toBe('function');
    expect(typeof suite.skipWhen).toBe('function');
    expect(typeof suite.omitWhen).toBe('function');
    expect(typeof suite.optional).toBe('function');
  });
});
