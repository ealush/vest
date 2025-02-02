import { describe, it, expect, vi } from 'vitest';
import wait from 'wait';

import { TIsolateTest } from 'IsolateTest';
import { VestTest } from 'VestTest';
import * as vest from 'vest';

describe('runAsyncTest', () => {
  describe('State Updates', () => {
    it('Should remove pending status from test object', async () => {
      let testObject: void | TIsolateTest = undefined;
      const suite = vest.create(() => {
        testObject = vest.test('field_1', async () => {
          await wait(100);
        });
      });
      suite.run();

      testObject = VestTest.cast(testObject);

      expect(VestTest.isPending(testObject)).toBe(true);
      await wait(100);
      expect(VestTest.isPending(testObject)).toBe(false);
    });
  });

  describe('Callbacks', () => {
    describe('When there are no remaining pending tests', () => {
      it('Should run all callbacks', async () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        const cb3 = vi.fn();

        const suite = vest.create(() => {
          vest.test('field_1', async () => {
            await wait(50);
          });
          vest.test('field_2', () => {});
          vest.test('field_3', async () => {
            await wait(100);
          });
        });

        suite
          .after(cb1)
          .afterField('field_1', cb2)
          .afterField('field_3', cb3)
          .run();

        expect(cb1).toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
        await wait(50);
        expect(cb1).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
        await wait(50);
        expect(cb1).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
        expect(cb3).toHaveBeenCalled();
      });
    });

    describe('When there are remaining pending tests', () => {
      it('Should only run field callbacks for completed tests', async () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        const cb3 = vi.fn();

        const suite = vest.create(() => {
          vest.test('field_1', async () => {
            await wait(100);
          });
          vest.test('field_2', () => {});
          vest.test('field_3', async () => {
            await wait(50);
          });
        });

        suite
          .after(cb1)
          .afterField('field_2', cb2)
          .afterField('field_3', cb3)
          .run();

        expect(cb1).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
        await wait(50);
        expect(cb1).toHaveBeenCalled();
        expect(cb3).toHaveBeenCalled();
        await wait(50);
        expect(cb1).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
        expect(cb3).toHaveBeenCalled();
      });
    });

    describe('When the test run was canceled', () => {
      it('Should not run the field callbacks', async () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        const cb3 = vi.fn();

        const testObject: Array<TIsolateTest> = [];

        const suite = vest.create(() => {
          testObject.push(
            vest.test('field_1', async () => {
              await wait(10);
            }),
          );
          vest.test('field_2', () => {});
        });

        suite
          .afterField('field_1', cb1)
          .afterField('field_1', cb2)
          .afterField('field_1', cb3)
          .run();

        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();

        suite.run();

        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
      });
    });
  });
  describe('Final test status', () => {
    describe('When passing', () => {
      it('Should set the test status to passing', async () => {
        let testObject: void | TIsolateTest = undefined;
        const suite = vest.create(() => {
          testObject = vest.test('field_1', async () => {
            await wait(100);
          });
        });
        suite.run();

        testObject = VestTest.cast(testObject);

        expect(VestTest.isPassing(testObject)).toBe(false);
        await wait(100);
        expect(VestTest.isPassing(testObject)).toBe(true);
      });
    });
    describe('When failing', () => {
      it('Should set the test status to failing', async () => {
        let testObject: void | TIsolateTest = undefined;
        const suite = vest.create(() => {
          testObject = vest.test('field_1', async () => {
            throw new Error('');
          });
        });
        suite.run();

        testObject = VestTest.cast(testObject);

        expect(VestTest.isFailing(testObject)).toBe(false);
        await wait(100);
        expect(VestTest.isFailing(testObject)).toBe(true);
      });
    });
    describe('When warning', () => {
      it('Should set the test status to failing', async () => {
        let testObject: void | TIsolateTest = undefined;
        const suite = vest.create(() => {
          testObject = vest.test('field_1', async () => {
            vest.warn();
            throw new Error('');
          });
        });
        suite.run();

        testObject = VestTest.cast(testObject);

        expect(VestTest.isWarning(testObject)).toBe(false);
        await wait(100);
        expect(VestTest.isWarning(testObject)).toBe(true);
      });
    });
  });
});
