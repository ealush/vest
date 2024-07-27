import * as vest from 'vest';

describe('Test Function Payload', () => {
  describe('AbortSignal', () => {
    it('Should pass abort signal to test functions', () => {
      const testFnSync = jest.fn();
      const testFnAsync = jest.fn().mockResolvedValue(undefined);
      const suite = vest.create(() => {
        vest.test('field_1', testFnSync);
        vest.test('field_2', testFnAsync);
      });
      suite();

      expect(callPayload(testFnSync).signal).toBeInstanceOf(AbortSignal);
      expect(callPayload(testFnAsync).signal).toBeInstanceOf(AbortSignal);
    });

    describe('When test is not canceled', () => {
      it('Should proceed without aborting the test', async () => {
        const testFn = jest.fn().mockResolvedValue(undefined);
        const suite = vest.create(() => {
          vest.test('field_1', testFn);
        });
        suite();

        await expect(callPayload(testFn).signal.aborted).toBe(false);
      });
    });

    describe('When test is canceled', () => {
      it('Should abort the test', async () => {
        const testFn = jest.fn().mockResolvedValue(undefined);
        const suite = vest.create(() => {
          vest.test('field_1', testFn);
        });
        suite();
        suite();

        await expect(callPayload(testFn).signal.aborted).toBe(true);
        await expect(callPayload(testFn, 1, 0).signal.aborted).toBe(false);
      });

      it('Should set the reason to `canceled`', async () => {
        const testFn = jest.fn().mockResolvedValue(undefined);
        const suite = vest.create(() => {
          vest.test('field_1', testFn);
        });
        suite();
        suite();

        await expect(callPayload(testFn).signal.reason).toBe('CANCELED');
      });
    });

    describe('Multiple async tests', () => {
      it('Should abort only the canceled test', async () => {
        const testFn1 = jest.fn().mockResolvedValue(undefined);
        const testFn2 = jest.fn().mockResolvedValue(undefined);

        const suite = vest.create((only?: string) => {
          vest.only(only);

          vest.test('field_1', testFn1);
          vest.test('field_2', testFn2);
        });

        suite();
        suite('field_1');

        await expect(callPayload(testFn1).signal.aborted).toBe(true);
        expect(callPayload(testFn2).signal.aborted).toBe(false);
      });
    });
  });
});

function callPayload(
  fn: jest.Mock<any, any, any>,
  call: number = 0,
  arg: number = 0,
) {
  return fn.mock.calls[call][arg];
}
