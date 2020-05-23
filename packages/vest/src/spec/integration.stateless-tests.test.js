import isDeepCopy from '../../testUtils/isDeepCopy';
import resetState from '../../testUtils/resetState';
import runSpec from '../../testUtils/runSpec';

runSpec(vest => {
  describe('stateless behavior', () => {
    let callback_1, callback_2, callback_3, callback_4;
    beforeEach(() => {
      callback_1 = jest.fn();
      callback_2 = jest.fn();
      callback_3 = jest.fn();
      callback_4 = jest.fn();
      resetState();
    });
    let result;
    test.skipOnWatch(
      'Should start suite with no previous data on each run',
      () =>
        new Promise(done => {
          // ✅ First suite tests basic behavior, and callback registration
          result = suite(vest, 'field_1')
            .done(callback_1)
            .done('field_1', callback_2)
            .done('field_2', callback_3);
          expect(result.tests.field_1.errorCount).toBe(1);
          expect(result.errorCount).toBe(1);
          expect(Object.keys(result.tests)).toHaveLength(1);
          expect(result.tests).toHaveProperty('field_1');
          expect(callback_1).toHaveBeenCalled();
          expect(callback_2).toHaveBeenCalled();
          expect(callback_3).not.toHaveBeenCalled();
          expect(result).toMatchSnapshot();

          // ✅ Second suite to test that values do not get merged
          result = suite(vest, 'field_5');
          expect(result.errorCount).toBe(2);
          expect(result.tests).not.toHaveProperty('field_1');
          expect(result.tests.field_5.errorCount).toBe(2);
          expect(Object.keys(result.tests)).toHaveLength(1);
          expect(result.tests).toHaveProperty('field_5');
          expect(result).toMatchSnapshot();

          // ✅ Last suite tests that even without skipping
          // Nothing gets merged and that we can still register the
          // callbacks - even after delay
          result = suite(vest);
          expect(result.errorCount).toBe(5);
          expect(result.tests.field_1.errorCount).toBe(1);
          expect(result.tests.field_2.errorCount).toBe(1);
          expect(result.tests.field_3.errorCount).toBe(1);
          expect(result.tests.field_4.warnCount).toBe(1);
          expect(result.tests.field_5.errorCount).toBe(2);
          expect(Object.keys(result.tests)).toHaveLength(5);
          expect(result).toMatchSnapshot();
          setTimeout(() => {
            // Testing that even though the state got discarded
            // We still register consumer callbacks
            expect(callback_4).not.toHaveBeenCalled();
            result.done(callback_4);
            expect(callback_4).toHaveBeenCalled();
            isDeepCopy(callback_4.mock.calls[0][0], result);
            done();
          });
        })
    );
  });
});

const suite = ({ validate, test, enforce, ...vest }, only) =>
  validate('suite_name', () => {
    vest.only(only);
    test('field_1', 'field_statement_1', () => false);
    test('field_2', 'field_statement_2', () => {
      enforce(2).equals(3);
    });
    test('field_3', 'field_statement_3', () => false);
    test('field_4', 'field_statement_4', () => {
      vest.warn();
      throw new Error();
    });
    test('field_4', 'field_statement_4', () => {
      vest.warn();
    });
    test('field_5', 'field_statement_5', () => false);
    test('field_5', 'field_statement_6', () => false);
  });
