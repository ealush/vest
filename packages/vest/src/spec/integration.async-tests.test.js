import resetState from '../../testUtils/resetState';
import runSpec from '../../testUtils/runSpec';

const suite = ({ validate, test, enforce, ...vest }) =>
  validate('suite_name', () => {
    test('field_1', 'field_statement_1', () => false);
    test('field_2', 'field_statement_2', () => {
      enforce(2).equals(3);
    });
    test('field_3', 'field_statement_3', () => {});
    test('field_4', 'field_statement_4', () => {
      vest.warn();
      throw new Error();
    });
    test('field_4', 'field_statement_4', () => {
      vest.warn();
    });
    test('field_5', 'field_statement_5', () => false);
    test('field_5', 'field_statement_6', () => false);
    test(
      'field_6',
      'async_statement_1',
      () =>
        new Promise(res => {
          setTimeout(res, 250);
        })
    );
    test('field_7', () => Promise.reject('async_statement_2'));
  });

runSpec(vest => {
  describe('Stateful behavior', () => {
    let result, callback_1, callback_2, callback_3, control;

    beforeAll(() => {
      callback_1 = jest.fn();
      callback_2 = jest.fn();
      callback_3 = jest.fn();
      control = jest.fn();
    });

    beforeEach(() => {
      resetState();
    });
    it('Should have all fields', () =>
      new Promise(done => {
        // ❗️Why is this test async? Because of the `resetState` beforeEach.
        // We must not clean up before the suite is actually done.
        result = suite(vest).done(done);
        expect(result.tests).toHaveProperty('field_1');
        expect(result.tests).toHaveProperty('field_2');
        expect(result.tests).toHaveProperty('field_4');
        expect(result.tests).toHaveProperty('field_5');
        expect(result.tests).toHaveProperty('field_6');
        expect(result.tests).toHaveProperty('field_7');
        expect(result.hasErrors('field_7')).toBe(false);
        expect(result.tests).toMatchSnapshot();
      }));

    it('Should invoke done callback specified with sync field immediately, and the others after finishing', () =>
      new Promise(done => {
        result = suite(vest);
        result
          .done('field_1', callback_1)
          .done('field_6', callback_2)
          .done(callback_3);
        expect(callback_1).toHaveBeenCalled();
        expect(callback_2).not.toHaveBeenCalled();
        expect(callback_3).not.toHaveBeenCalled();

        setTimeout(() => {
          expect(callback_2).not.toHaveBeenCalled();
          expect(callback_3).not.toHaveBeenCalled();
          expect(result.hasErrors('field_7')).toBe(true);
          control();
          expect;
        });

        setTimeout(() => {
          expect(callback_2).toHaveBeenCalled();
          expect(callback_3).toHaveBeenCalled();
          expect(control).toHaveBeenCalled();
          done();
        }, 250);
      }));
  });
});
