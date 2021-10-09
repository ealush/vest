import { useOptionalFields } from 'stateHooks';
import { optional, create, test } from 'vest';

describe('optional hook', () => {
  it('Should add optional fields to state', () => {
    return new Promise<void>(done => {
      create(() => {
        expect(useOptionalFields()[0]).toMatchInlineSnapshot(`Object {}`);
        optional('field_1');
        expect(useOptionalFields()[0]).toMatchInlineSnapshot(`
          Object {
            "field_1": true,
          }
        `);
        optional(['field_2', 'field_3']);
        expect(useOptionalFields()[0]).toMatchInlineSnapshot(`
          Object {
            "field_1": true,
            "field_2": true,
            "field_3": true,
          }
        `);
      })();

      done();
    });
  });

  describe('Functional Optional Interface', () => {
    it('Should omit test failures based on optional functions', () => {
      const suite = create(() => {
        optional({
          f1: () => true,
          f2: () => true,
        });

        test('f1', () => false);
        test('f2', () => false);
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
        const suite = create(() => {
          optional({
            f1: () => !suite.get().hasErrors('f2'),
            f2: () => !suite.get().hasErrors('f1'),
          });

          test('f1', () => false);
          test('f2', () => true);
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
});
