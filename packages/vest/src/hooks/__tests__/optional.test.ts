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

  // this is the example from the docs so it better be working
  describe('Getting suite result within the optional function', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = vest.create((data = {}, currentField) => {
        vest.only(currentField);
        vest.optional({
          a: () => suite.get().isValid('b') || suite.get().isValid('c'),
          b: () => suite.get().isValid('a') || suite.get().isValid('c'),
          c: () => suite.get().isValid('a') || suite.get().isValid('b'),
        });

        vest.test('a', () => {
          vest.enforce(data.a).isTruthy();
        });
        vest.test('b', () => {
          vest.enforce(data.b).isTruthy();
        });
        vest.test('c', () => {
          vest.enforce(data.c).isTruthy();
        });
      });
    });

    it('Should omit tests based on other tests in the suite', () => {
      expect(suite({ a: 1, b: 0, c: 0 }).isValid('a')).toBe(true);
      expect(suite({ a: 1, b: 0, c: 0 }).isValid('b')).toBe(true);
      expect(suite({ a: 1, b: 0, c: 0 }).isValid('c')).toBe(true);
      expect(suite({ a: 1, b: 0, c: 0 }).isValid()).toBe(true);
      expect(suite({ a: 0, b: 1, c: 0 }).isValid('a')).toBe(true);
      expect(suite({ a: 0, b: 1, c: 0 }).isValid('b')).toBe(true);
      expect(suite({ a: 0, b: 1, c: 0 }).isValid('c')).toBe(true);
      expect(suite({ a: 0, b: 1, c: 0 }).isValid()).toBe(true);
      expect(suite({ a: 0, b: 0, c: 1 }).isValid('a')).toBe(true);
      expect(suite({ a: 0, b: 0, c: 1 }).isValid('b')).toBe(true);
      expect(suite({ a: 0, b: 0, c: 1 }).isValid('c')).toBe(true);
      expect(suite({ a: 0, b: 0, c: 1 }).isValid()).toBe(true);
    });

    describe('when focused with vest.only', () => {
      it('Should keep optional fields even if not all tests ran yet', () => {
        const res = suite({ a: 1, b: 0, c: 0 }, 'a');
        expect(res.isValid('a')).toBe(true);
        expect(res.isValid('b')).toBe(true);
        expect(res.isValid('c')).toBe(true);
        expect(res.isValid()).toBe(true);
      });

      it('Should revert optional fields when none of the fields are valid anymore', () => {
        let res = suite({ a: 1, b: 0, c: 0 }, 'a');
        expect(res.isValid()).toBe(true);
        res = suite({ a: 0, b: 0, c: 0 }, 'a');
        expect(res.isValid()).toBe(false);
        res = suite({ a: 0, b: 1, c: 0 }, 'b');
        expect(res.isValid()).toBe(true);
        res = suite({ a: 0, b: 0, c: 0 }, 'b');
        expect(res.isValid()).toBe(false);
      });
    });
  });
});
