import wait from 'wait';

import { TestWalker } from 'TestWalker';
import * as vest from 'vest';

describe('TestWalker.hasRemainingTests', () => {
  let hasRemaining: boolean | null = null;
  let count = 0;

  beforeEach(() => {
    hasRemaining = null;
    count = 0;
  });
  describe('When no field specified', () => {
    describe('When no remaining tests', () => {
      it('should return false', () => {
        vest.create(() => {
          hasRemaining = TestWalker.hasRemainingTests();
        })();
        expect(hasRemaining).toBe(false);
      });
    });

    describe('When there are remaining tests', () => {
      it('pending tests return true', () => {
        vest.create(() => {
          vest.test('f1', async () => {
            await wait(100);
          });
          hasRemaining = TestWalker.hasRemainingTests();
        })();

        expect(hasRemaining).toBe(true);
      });

      it('lagging tests return true', () => {
        const suite = vest.create(() => {
          vest.skip(count ? 'f1' : undefined);
          vest.test('f1', async () => {
            await wait(100);
          });
          count++;
          hasRemaining = TestWalker.hasRemainingTests();
        });
        suite();
        suite();

        expect(hasRemaining).toBe(true);
      });

      it('lagging and pending tests return true', () => {
        const suite = vest.create(() => {
          vest.skip(count ? 'f1' : undefined);
          vest.test('f1', async () => {
            await wait(100);
          });
          vest.test('f2', async () => {
            await wait(100);
          });
          count++;
          hasRemaining = TestWalker.hasRemainingTests();
        });

        suite();
        suite();

        expect(hasRemaining).toBe(true);
      });
    });
  });

  describe('When field specified', () => {
    describe('When no remaining tests', () => {
      it('Should return false', () => {
        vest.create(() => {
          hasRemaining = TestWalker.hasRemainingTests('f1');
        })();
        expect(hasRemaining).toBe(false);
      });
    });

    describe('When remaining tests', () => {
      it('pending tests return true', () => {
        vest.create(() => {
          vest.test('f1', async () => {
            await wait(100);
          });
          hasRemaining = TestWalker.hasRemainingTests('f1');
        })();
        expect(hasRemaining).toBe(true);
      });

      it('lagging tests return true', () => {
        const suite = vest.create(() => {
          vest.skip(count ? 'f1' : undefined);
          vest.test('f1', async () => {
            await wait(100);
          });
          count++;
          hasRemaining = TestWalker.hasRemainingTests('f1');
        });
        suite();
        suite();

        expect(hasRemaining).toBe(true);
      });

      it('lagging and pending tests return true', () => {
        const suite = vest.create(() => {
          vest.skip(count ? 'f1' : undefined);
          vest.test('f1', async () => {
            await wait(100);
          });
          vest.test('f2', async () => {
            await wait(100);
          });
          count++;
          hasRemaining =
            TestWalker.hasRemainingTests('f1') &&
            TestWalker.hasRemainingTests('f2');
        });

        suite();
        suite();

        expect(hasRemaining).toBe(true);
      });
    });
  });
});
