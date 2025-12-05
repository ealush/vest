import { describe, it, expect, vi } from 'vitest';
import wait from 'wait';

import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import * as vest from '../../../vest';
import { TIsolateTest } from '../../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../isolate/IsolateTest/VestTest';

describe('runAsyncTest', () => {
  describe('State Updates', () => {
    it('Should remove pending status from test object', async () => {
      let testObject: TIsolateTest | undefined = undefined;
      const suite = vest.create(() => {
        testObject = vest.test('field_1' as TFieldName, async () => {
          await wait(100);
        });
      });
      suite.run();

      testObject = VestTest.cast(testObject);

      expect(VestTest.isStartedStatus(testObject)).toBe(true);
      await wait(100);
      expect(VestTest.isStartedStatus(testObject)).toBe(false);
    });
  });

  describe('Callbacks', () => {
    describe('When there are no remaining pending tests', () => {
      it('Should run all callbacks', async () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        const cb3 = vi.fn();

        const suite = vest.create(() => {
          vest.test('field_1' as TFieldName, async () => {
            await wait(50);
          });
          vest.test('field_2' as TFieldName, () => {});
          vest.test('field_3' as TFieldName, async () => {
            await wait(100);
          });
        });

        suite
          .afterEach(cb1)
          .afterField('field_1' as TFieldName, cb2)
          .afterField('field_3' as TFieldName, cb3)
          .run();

        expect(cb1).toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
        await wait(55);
        expect(cb1).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
        await wait(55);
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
          vest.test('field_1' as TFieldName, async () => {
            await wait(100);
          });
          vest.test('field_2' as TFieldName, () => {});
          vest.test('field_3' as TFieldName, async () => {
            await wait(50);
          });
        });

        suite
          .afterEach(cb1)
          .afterField('field_2' as TFieldName, cb2)
          .afterField('field_3' as TFieldName, cb3)
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
            vest.test('field_1' as TFieldName, async () => {
              await wait(10);
            }),
          );
          vest.test('field_2' as TFieldName, () => {});
        });

        suite
          .afterField('field_1' as TFieldName, cb1)
          .afterField('field_1' as TFieldName, cb2)
          .afterField('field_1' as TFieldName, cb3)
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
        let testObject: TIsolateTest | undefined = undefined;
        const suite = vest.create(() => {
          testObject = vest.test('field_1' as TFieldName, async () => {
            await wait(100);
          });
        });
        suite.run();

        testObject = VestTest.cast(testObject);

        expect(VestTest.isPassing(testObject).unwrap()).toBe(false);
        await wait(100);
        expect(VestTest.isPassing(testObject).unwrap()).toBe(true);
      });
    });
    describe('When failing', () => {
      it('Should set the test status to failing', async () => {
        let testObject: TIsolateTest | undefined = undefined;
        const suite = vest.create(() => {
          testObject = vest.test('field_1' as TFieldName, async () => {
            throw new Error('');
          });
        });
        suite.run();

        testObject = VestTest.cast(testObject);

        expect(VestTest.isFailing(testObject).unwrap()).toBe(false);
        await wait(100);
        expect(VestTest.isFailing(testObject).unwrap()).toBe(true);
      });
    });
    describe('When warning', () => {
      it('Should set the test status to failing', async () => {
        let testObject: TIsolateTest | undefined = undefined;
        const suite = vest.create(() => {
          testObject = vest.test('field_1' as TFieldName, async () => {
            vest.warn();
            throw new Error('');
          });
        });
        suite.run();

        testObject = VestTest.cast(testObject);

        expect(VestTest.isWarning(testObject).unwrap()).toBe(false);
        await wait(100);
        expect(VestTest.isWarning(testObject).unwrap()).toBe(true);
      });
    });
  });
});
