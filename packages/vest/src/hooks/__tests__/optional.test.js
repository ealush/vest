import { useOptionalFields } from 'stateHooks';
import vest, { optional } from 'vest';

describe('optional hook', () => {
  it('Should add optional fields to state', () => {
    return new Promise(done => {
      vest.create(() => {
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
});
