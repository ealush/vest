import { VestTest } from 'VestTest';
import wait from 'wait';

import { asVestTest } from '../../../testUtils/asVestTest';

import * as vest from 'vest';

describe('runAsyncTest', () => {
  describe('State Updates', () => {
    it('Should remove pending status from test object', async () => {
      let testObject: void | vest.IsolateTest = undefined;
      const suite = vest.create(() => {
        testObject = vest.test('field_1', async () => {
          await wait(100);
        });
      });
      suite();

      testObject = asVestTest(testObject);

      expect(VestTest.isPending(testObject)).toBe(true);
      await wait(100);
      expect(VestTest.isPending(testObject)).toBe(false);
    });
  });

  describe('Callbacks', () => {
    describe('When there are no remaining pending tests', () => {
      it('Should run all callbacks', async () => {
        const cb1 = jest.fn();
        const cb2 = jest.fn();
        const cb3 = jest.fn();

        const suite = vest.create(() => {
          vest.test('field_1', async () => {
            await wait(100);
          });
          vest.test('field_2', () => {});
          vest.test('field_3', async () => {
            await wait(50);
          });
        });

        suite().done(cb1).done(cb2).done('field_1', cb3);

        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
        await wait(50);
        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
        await wait(50);
        expect(cb1).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
        expect(cb3).toHaveBeenCalled();
      });
    });

    describe('When there are remaining pending tests', () => {
      it('Should only run callbacks for completed tests', async () => {
        const cb1 = jest.fn();
        const cb2 = jest.fn();
        const cb3 = jest.fn();

        const suite = vest.create(() => {
          vest.test('field_1', async () => {
            await wait(100);
          });
          vest.test('field_2', () => {});
          vest.test('field_3', async () => {
            await wait(50);
          });
        });

        suite().done(cb1).done('field_2', cb2).done('field_3', cb3);

        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
        await wait(50);
        expect(cb1).not.toHaveBeenCalled();
        expect(cb3).toHaveBeenCalled();
        await wait(50);
        expect(cb1).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
        expect(cb3).toHaveBeenCalled();
      });
    });

    describe('When the test run was canceled', () => {
      it('Should not run the callbacks', async () => {
        const cb1 = jest.fn();
        const cb2 = jest.fn();
        const cb3 = jest.fn();

        const testObject: Array<vest.IsolateTest> = [];

        const suite = vest.create(() => {
          testObject.push(
            vest.test('field_1', async () => {
              await wait(10);
            })
          );
          vest.test('field_2', () => {});
        });

        suite().done(cb1).done(cb2).done('field_1', cb3);

        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();

        suite();

        await wait(10);
        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
      });
    });
  });
  describe('Final test status', () => {
    describe('When passing', () => {
      it('Should set the test status to passing', async () => {
        let testObject: void | vest.IsolateTest = undefined;
        const suite = vest.create(() => {
          testObject = vest.test('field_1', async () => {
            await wait(100);
          });
        });
        suite();

        testObject = asVestTest(testObject);

        expect(VestTest.isPassing(testObject)).toBe(false);
        await wait(100);
        expect(VestTest.isPassing(testObject)).toBe(true);
      });
    });
    describe('When failing', () => {
      it('Should set the test status to failing', async () => {
        let testObject: void | vest.IsolateTest = undefined;
        const suite = vest.create(() => {
          testObject = vest.test('field_1', async () => {
            throw new Error('');
          });
        });
        suite();

        testObject = asVestTest(testObject);

        expect(VestTest.isFailing(testObject)).toBe(false);
        await wait(100);
        expect(VestTest.isFailing(testObject)).toBe(true);
      });
    });
    describe('When warning', () => {
      it('Should set the test status to failing', async () => {
        let testObject: void | vest.IsolateTest = undefined;
        const suite = vest.create(() => {
          testObject = vest.test('field_1', async () => {
            vest.warn();
            throw new Error('');
          });
        });
        suite();

        testObject = asVestTest(testObject);

        expect(VestTest.isWarning(testObject)).toBe(false);
        await wait(100);
        expect(VestTest.isWarning(testObject)).toBe(true);
      });
    });
  });
});
