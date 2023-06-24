import { BlankValue } from 'vest-utils';
import wait from 'wait';

import { TTestSuite } from 'testUtils/TVestMock';
import * as vest from 'vest';

jest.useFakeTimers();

describe('optional hook', () => {
  describe('Auto Optional Interface', () => {
    describe('When the optional value is blank in the data object', () => {
      it('empty-string: Should omit the field as optional', () => {
        const suite = vest.create(_ => {
          vest.optional(['f1', 'f2']);

          vest.test('f1', () => false);
          vest.test('f2', () => false);
        });

        const res = suite({ f1: '', f2: '' });

        expect(res.hasErrors('f1')).toBe(false);
        expect(res.hasErrors('f2')).toBe(false);
        expect(res.isValid('f1')).toBe(true);
        expect(res.isValid('f2')).toBe(true);
        expect(res.isValid()).toBe(true);
      });

      it('null: Should omit the field as optional', () => {
        const suite = vest.create(_ => {
          vest.optional(['f1', 'f2']);

          vest.test('f1', () => false);
          vest.test('f2', () => false);
        });

        const res = suite({ f1: null, f2: null });

        expect(res.hasErrors('f1')).toBe(false);
        expect(res.hasErrors('f2')).toBe(false);
        expect(res.isValid('f1')).toBe(true);
        expect(res.isValid('f2')).toBe(true);
        expect(res.isValid()).toBe(true);
      });

      describe('When the test was skipped', () => {
        it('Should omit the field as optional', () => {
          const suite = vest.create(_ => {
            vest.only('f5');
            vest.optional('f1');

            vest.test('f1', () => false);
          });

          const res = suite({ f1: 'foo' });

          expect(res.hasErrors('f1')).toBe(false);
          expect(res.isValid('f1')).toBe(true);
          expect(res.isValid()).toBe(true);
        });
      });
    });

    describe('When the optional value does not exist in the data object', () => {
      describe('When the test ran', () => {
        it('Should mark the field as failing', () => {
          const suite = vest.create(_ => {
            vest.optional(['f1', 'f2']);

            vest.test('f1', () => false);
            vest.test('f2', () => false);
          });

          const res = suite({});

          expect(res.hasErrors('f1')).toBe(true);
          expect(res.hasErrors('f2')).toBe(true);
          expect(res.isValid('f1')).toBe(false);
          expect(res.isValid('f2')).toBe(false);
          expect(res.isValid()).toBe(false);
        });
      });

      describe('When te test was skipped', () => {
        it('Should omit the field as optional', () => {
          const suite = vest.create(_ => {
            vest.only('f1');
            vest.optional(['f1', 'f2']);

            vest.test('f1', () => false);
            vest.test('f2', () => false);
          });

          const res = suite({});

          expect(res.hasErrors('f1')).toBe(true);
          expect(res.hasErrors('f2')).toBe(false);
          expect(res.isValid('f1')).toBe(false);
          expect(res.isValid('f2')).toBe(true);
          expect(res.isValid()).toBe(false);
        });
      });
    });
  });

  describe('Custom Logic Optional Interface', () => {
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

      describe('When multiple tests of the same field are omitted', () => {
        it('Should omit the field', () => {
          const suite = vest.create(() => {
            vest.optional({
              f1: () => true,
            });

            vest.test('f1', () => false);
            vest.test('f1', () => false);
          });

          const res = suite();

          expect(res.hasErrors('f1')).toBe(false);
          expect(res.isValid('f1')).toBe(true);
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

    describe('Field value based optional', () => {
      describe('When field is blank', () => {
        it.each([undefined, null, ''] as BlankValue[])(
          '%s: Should omit field as optional',
          value => {
            const suite = vest.create(() => {
              vest.optional({
                field_1: value,
              });
              vest.test('field_1', () => false);
            });

            const res = suite();

            expect(res.hasErrors('field_1')).toBe(false);
            expect(res.isValid('field_1')).toBe(true);
            expect(res.isValid()).toBe(true);
          }
        );
      });

      describe('When the field is falsy but not blank', () => {
        it.each([0, NaN])('%s: Should fail the field normally', value => {
          const suite = vest.create(() => {
            vest.optional({
              field_1: value,
            });
            vest.test('field_1', () => false);
          });

          const res = suite();

          expect(res.hasErrors('field_1')).toBe(true);
          expect(res.isValid('field_1')).toBe(false);
          expect(res.isValid()).toBe(false);
        });
      });

      describe('When the field is boolean', () => {
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

  describe('Optional test is async', () => {
    let suite: TTestSuite;

    describe('auto', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.optional('field_1');
          vest.test('field_1', async () => {
            await wait(100);
            vest.enforce(1).equals(2);
          });
        });
      });
      describe('Before the test completed', () => {
        it('Should be considered as non-valid', () => {
          const res = suite();
          expect(res.isValid()).toBe(false);
          expect(res.isValid('field_1')).toBe(false);
        });
      });
      describe('After the test completed', () => {
        it('Should be considered as non-valid', () => {
          const res = suite();
          jest.runAllTimers();
          expect(res.isValid()).toBe(false);
          expect(res.isValid('field_1')).toBe(false);
        });
      });
    });

    describe('custom', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.optional({
            field_1: () => true,
          });
          vest.test('field_1', async () => {
            await wait(100);
            vest.enforce(1).equals(2);
          });
        });
      });

      describe('Before the test completed', () => {
        it('Should be considered as non-valid', () => {
          const res = suite();
          expect(res.isValid('field_1')).toBe(false);
          expect(res.isValid()).toBe(false);
        });
      });

      describe('After the test completed', () => {
        it('Should be considered as valid', async () => {
          suite();
          await jest.runAllTimersAsync();
          expect(suite.isValid()).toBe(true);
          expect(suite.isValid('field_1')).toBe(true);
        });
      });
    });
  });

  describe('Optional Sync test depends on async tests', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = vest.create(() => {
        vest.optional({
          field_1: () => suite.get().isValid('field_2'),
        });
        vest.test('field_1', () => {
          vest.enforce(1).equals(2);
        });
        vest.test('field_2', async () => {
          await wait(100);
          vest.enforce(1).equals(1);
        });
      });
    });

    describe('Before the test completed', () => {
      it('Should be considered as not valid', () => {
        const res = suite();
        expect(res.isValid()).toBe(false);
        expect(res.isValid('field_1')).toBe(false);
        expect(res.isValid('field_2')).toBe(false);
      });
    });

    describe('After the test completed', () => {
      it('Should be considered as valid', async () => {
        suite();
        await jest.runAllTimersAsync();
        expect(suite.isValid('field_2')).toBe(true);
        expect(suite.isValid()).toBe(true);
        expect(suite.isValid('field_1')).toBe(true);
      });
    });
  });
});
