import wait from 'wait';

import { SuiteWalker } from 'SuiteWalker';
import * as vest from 'vest';

describe('SuiteWalker.useHasRemainingWithTestNameMatching', () => {
  let hasRemaining: boolean | null = null;
  let count = 0;

  beforeEach(() => {
    hasRemaining = null;
    count = 0;
  });
  describe('When no field specified', () => {
    describe('When no remaining tests', () => {
      it('should return false', () => {
        const suite = vest.create(() => {})();
        expect(suite.isPending()).toBe(false);
      });
    });

    describe('When there are remaining tests', () => {
      it('pending tests return true', () => {
        const suite = vest.create(() => {
          vest.test('f1', async () => {
            await wait(100);
          });
        })();

        expect(suite.isPending()).toBe(true);
      });

      it('lagging tests return true', () => {
        const suite = vest.create(() => {
          vest.skip(count ? 'f1' : undefined);
          vest.test('f1', async () => {
            await wait(100);
          });
          count++;
        });
        suite();
        suite();

        expect(suite.isPending()).toBe(true);
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
        });

        suite();
        suite();

        expect(suite.isPending()).toBe(true);
      });
    });
  });

  describe('When field specified', () => {
    describe('When no remaining tests', () => {
      it('Should return false', () => {
        const suite = vest.create(() => {})();
        expect(suite.isPending('f1')).toBe(false);
      });
    });

    describe('When remaining tests', () => {
      it('pending tests return true', () => {
        const suite = vest.create(() => {
          vest.test('f1', async () => {
            await wait(100);
          });
        })();
        expect(suite.isPending('f1')).toBe(true);
      });

      it('lagging tests return true', () => {
        const suite = vest.create(() => {
          vest.skip(count ? 'f1' : undefined);
          vest.test('f1', async () => {
            await wait(100);
          });
          count++;
        });
        suite();
        suite();

        expect(suite.isPending('f1')).toBe(true);
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
        });

        suite();
        suite();

        expect(suite.isPending('f1')).toBe(true);
        expect(suite.isPending('f2')).toBe(true);
      });
    });
  });
});
