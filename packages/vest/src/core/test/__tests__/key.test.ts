import { create, test, skipWhen } from 'vest';

describe('key', () => {
  describe('When key is provided', () => {
    describe('When tests change their order between runs', () => {
      it('Should retain test results', () => {
        let count = 0;
        const suite = create(() => {
          if (count === 0) {
            test('field_1', () => false, 'field_1_key_1');
            test('field_1', () => undefined, 'field_1_key_2');
            test('field_2', () => false, 'field_2_key_1');
            test('field_2', () => undefined, 'field_2_key_2');
          } else {
            skipWhen(true, () => {
              test('field_2', () => undefined, 'field_2_key_2');
              test('field_2', () => false, 'field_2_key_1');
              test('field_1', () => undefined, 'field_1_key_2');
              test('field_1', () => false, 'field_1_key_1');
            });
          }
          count++;
        });

        const res1 = suite();
        const res2 = suite();

        expect(res1.tests).toEqual(res2.tests);
      });
    });
  });
});
