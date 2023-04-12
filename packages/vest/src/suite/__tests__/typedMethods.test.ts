import * as vest from 'vest';

describe('typed methods', () => {
  test('it should actually work', () => {
    const suite = vest.create<() => void, 'USERNAME' | 'PASSWORD'>(() => {
      only('PASSWORD');
    });
    const { test, only } = suite;
  });
});
