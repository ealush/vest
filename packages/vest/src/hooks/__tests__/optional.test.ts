import { TTestSuite } from 'testUtils/TVestMock';
import * as vest from 'vest';

describe('optional hook', () => {
  describe('Functional Optional Interface', () => {
    it('Should omit test failures based on optional functions', () => {
      const suite = vest.create(() => {
        vest.optional({
          f1: () => true,
          f2: () => true,
        });

        vest.test('f1', () => false);
        vest.test('f2', () => false);
      });

      const res = suite();

      expect(res.hasErrors('f1')).toBe(false);
      expect(res.hasErrors('f2')).toBe(false);
      expect(res.isValid('f1')).toBe(true);
      expect(res.isValid('f2')).toBe(true);
      expect(res.isValid()).toBe(true);
    });

    describe('example: "any of" test', () => {
      it('Should allow specifying custom optional based on other tests in the suite', () => {
        const suite = vest.create(() => {
          vest.optional({
            f1: () => !suite.get().hasErrors('f2'),
            f2: () => !suite.get().hasErrors('f1'),
          });

          vest.test('f1', () => false);
          vest.test('f2', () => true);
        });

        const res = suite();

        expect(res.hasErrors('f1')).toBe(false);
        expect(res.hasErrors('f2')).toBe(false);
        expect(res.isValid('f1')).toBe(true);
        expect(res.isValid('f2')).toBe(true);
        expect(res.isValid()).toBe(true);
      });
    });
  });

  describe('boolean optional field indicator', () => {
    describe('When true', () => {
      it('Should omit field as optional', () => {
        const suite = vest.create(() => {
          vest.optional({
            field_1: true,
          });
          vest.test('field_1', () => false);
        });

        const res = suite();

        expect(res.hasErrors('field_1')).toBe(false);
        expect(res.isValid('field_1')).toBe(true);
        expect(res.isValid()).toBe(true);
      });
    });

    describe('When false', () => {
      it('Should fail the field normally', () => {
        const suite = vest.create(() => {
          vest.optional({
            field_1: false,
          });
          vest.test('field_1', () => false);
        });

        const res = suite();

        expect(res.hasErrors('field_1')).toBe(true);
        expect(res.isValid('field_1')).toBe(false);
        expect(res.isValid()).toBe(false);
      });
    });
  });

  describe('Test example from the docs', () => {
    let suite: TTestSuite, res: vest.SuiteRunResult<string, string>;

    beforeEach(() => {
      suite = vest.create((data = {}, currentField) => {
        vest.only(currentField);

        vest.optional({
          chk_a: () =>
            suite.get().isValid('chk_b') || suite.get().isValid('chk_c'),
          chk_b: () =>
            suite.get().isValid('chk_a') || suite.get().isValid('chk_c'),
          chk_c: () =>
            suite.get().isValid('chk_a') || suite.get().isValid('chk_b'),
        });

        vest.test('chk_a', () => {
          vest.enforce(data.chk_a).isTruthy();
        });
        vest.test('chk_b', () => {
          vest.enforce(data.chk_b).isTruthy();
        });
        vest.test('chk_c', () => {
          vest.enforce(data.chk_c).isTruthy();
        });
      });
    });

    test.only('Should pass when only one of the fields is true', () => {
      res = suite({ chk_a: true, chk_b: false, chk_c: false }, 'chk_a');
      expect(res.isValid('chk_a')).toBe(true);
      expect(res.isValid()).toBe(true);
    });
  });
});
