import * as vest from 'vest';

describe('AsyncTests', () => {
  describe('AbortSignal', () => {
    it('Should pass abort signal to test functions', () => {
      const testFnSync = jest.fn();
      const testFnAsync = jest.fn().mockResolvedValue(undefined);
      const suite = vest.create(() => {
        vest.test('field_1', testFnSync);
        vest.test('field_2', testFnAsync);
      });
      suite();

      expect(testFnSync.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
      expect(testFnAsync.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
    });

    describe('When test is not canceled', () => {
      it('Should proceed without aborting the test', async () => {
        const testFn = jest.fn().mockResolvedValue(undefined);
        const suite = vest.create(() => {
          vest.test('field_1', testFn);
        });
        suite();

        await expect(testFn.mock.calls[0][0].aborted).toBe(false);
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

        await expect(testFn.mock.calls[0][0].aborted).toBe(true);
        await expect(testFn.mock.calls[1][0].aborted).toBe(false);
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

        await expect(testFn1.mock.calls[0][0].aborted).toBe(true);
        expect(testFn2.mock.calls[0][0].aborted).toBe(false);
      });
    });
  });
});
