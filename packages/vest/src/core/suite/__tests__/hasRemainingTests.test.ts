import wait from 'wait';

import hasRemainingTests from 'hasRemainingTests';
import * as vest from 'vest';

describe('hasRemainingTests', () => {
  let hasRemaining = null;
  let count = 0;

  beforeEach(() => {
    hasRemaining = null;
    count = 0;
  });
  describe('When no field specified', () => {
    describe('When no remaining tests', () => {
      it('should return false', () => {
        vest.create(() => {
          hasRemaining = hasRemainingTests();
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
          hasRemaining = hasRemainingTests();
        })();

        expect(hasRemaining).toBe(true);
      });

      it('lagging tests return true', () => {
        const suite = vest.create(() => {
          if (count) vest.skip('f1');
          vest.test('f1', async () => {
            await wait(100);
          });
          count++;
          hasRemaining = hasRemainingTests();
        });
        suite();
        suite();

        expect(hasRemaining).toBe(true);
      });

      it('lagging and pending tests return true', () => {
        const suite = vest.create(() => {
          if (count) vest.skip('f1');
          vest.test('f1', async () => {
            await wait(100);
          });
          vest.test('f2', async () => {
            await wait(100);
          });
          count++;
          hasRemaining = hasRemainingTests();
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
          hasRemaining = hasRemainingTests('f1');
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
          hasRemaining = hasRemainingTests('f1');
        })();
        expect(hasRemaining).toBe(true);
      });

      it('lagging tests return true', () => {
        const suite = vest.create(() => {
          if (count) vest.skip('f1');
          vest.test('f1', async () => {
            await wait(100);
          });
          count++;
          hasRemaining = hasRemainingTests('f1');
        });
        suite();
        suite();

        expect(hasRemaining).toBe(true);
      });

      it('lagging and pending tests return true', () => {
        const suite = vest.create(() => {
          if (count) vest.skip('f1');
          vest.test('f1', async () => {
            await wait(100);
          });
          vest.test('f2', async () => {
            await wait(100);
          });
          count++;
          hasRemaining = hasRemainingTests('f1') && hasRemainingTests('f2');
        });

        suite();
        suite();

        expect(hasRemaining).toBe(true);
      });
    });
  });
});
