import wait from 'wait';

import { SuiteWalker } from 'SuiteWalker';
import * as vest from 'vest';

describe('SuiteWalker.hasRemainingWithTestNameMatching', () => {
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
          hasRemaining = SuiteWalker.hasRemainingWithTestNameMatching();
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
          hasRemaining = SuiteWalker.hasRemainingWithTestNameMatching();
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
          hasRemaining = SuiteWalker.hasRemainingWithTestNameMatching();
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
          hasRemaining = SuiteWalker.hasRemainingWithTestNameMatching();
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
          hasRemaining = SuiteWalker.hasRemainingWithTestNameMatching('f1');
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
          hasRemaining = SuiteWalker.hasRemainingWithTestNameMatching('f1');
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
          hasRemaining = SuiteWalker.hasRemainingWithTestNameMatching('f1');
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
            SuiteWalker.hasRemainingWithTestNameMatching('f1') &&
            SuiteWalker.hasRemainingWithTestNameMatching('f2');
        });

        suite();
        suite();

        expect(hasRemaining).toBe(true);
      });
    });
  });
});
