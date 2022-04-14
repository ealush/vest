import * as vest from 'vest';
import { omitWhen, only } from 'vest';

describe('omitWhen', () => {
  let suite, cb1, cb2, cb3, cb4, cb5, allFieldsPass;

  beforeEach(() => {
    cb1 = jest.fn();
    cb2 = jest.fn(() => (allFieldsPass ? undefined : false));
    cb3 = jest.fn(() => (allFieldsPass ? undefined : false));
    cb4 = jest.fn(() => (allFieldsPass ? undefined : false));
    cb5 = jest.fn();

    suite = vest.create((omitConditional, currentField) => {
      only(currentField);
      vest.test('field_1', cb1);
      vest.test('field_2', cb2);

      omitWhen(omitConditional, () => {
        vest.test('field_1', cb3);
        vest.test('field_3', cb4);
        vest.test('field_4', cb5);
      });
    });
  });

  afterEach(() => {
    allFieldsPass = undefined;
  });

  describe('When conditional is falsy', () => {
    describe.each([
      ['boolean conditional', false],
      ['function conditional', () => false],
    ])('%s', (_, omitConditional) => {
      it('Should run tests normally', () => {
        suite(omitConditional, 'field_1');
        expect(cb1).toHaveBeenCalledTimes(1);
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).toHaveBeenCalledTimes(1);
        expect(cb4).not.toHaveBeenCalled();
        expect(cb5).not.toHaveBeenCalled();
        expect(suite.get().hasErrors('field_1')).toBe(true);
        expect(suite.get().tests.field_1.testCount).toBe(2);
        expect(suite.get().tests.field_1.errorCount).toBe(1);
        expect(suite.get().hasErrors('field_2')).toBe(false);
        expect(suite.get().hasErrors('field_3')).toBe(false);
        expect(suite.get().hasErrors('field_4')).toBe(false);
        expect(suite.get().tests).toMatchSnapshot();
        suite(omitConditional, 'field_4');
        expect(cb1).toHaveBeenCalledTimes(1);
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).toHaveBeenCalledTimes(1);
        expect(cb4).not.toHaveBeenCalled();
        expect(cb5).toHaveBeenCalledTimes(1);
        expect(suite.get().hasErrors('field_1')).toBe(true);
        expect(suite.get().tests.field_1.testCount).toBe(2);
        expect(suite.get().tests.field_1.errorCount).toBe(1);
        expect(suite.get().hasErrors('field_2')).toBe(false);
        expect(suite.get().hasErrors('field_3')).toBe(false);
        expect(suite.get().hasErrors('field_4')).toBe(false);
        expect(suite.get().tests.field_4.testCount).toBe(1);
        expect(suite.get().tests.field_4.errorCount).toBe(0);
        expect(suite.get().tests).toMatchSnapshot();
      });

      it('Should have all tests within the omit block referenced in the result', () => {
        suite(omitConditional, 'field_1');
        expect(suite.get().tests.field_1).toBeDefined();
        expect(suite.get().tests.field_3).toBeDefined();
        expect(suite.get().tests.field_4).toBeDefined();
        expect(suite.get().tests).toMatchSnapshot();
      });

      it('Should retain normal `isValid` functionality', () => {
        expect(suite.get().isValid()).toBe(false);
        suite(omitConditional, 'field_1');
        expect(suite.get().isValid()).toBe(false);
        allFieldsPass = true;
        suite(omitConditional);
        expect(suite.get().isValid()).toBe(true);
      });
    });
  });

  describe('When conditional is truthy', () => {
    describe.each([
      ['boolean conditional', true],
      ['function conditional', () => true],
    ])('%s', (_, omitConditional) => {
      it('Should avoid running the omitted tests', () => {
        suite(omitConditional, 'field_1');
        expect(suite.get().tests.field_1.testCount).toBe(1);
        suite(omitConditional, 'field_2');
        expect(suite.get().tests.field_2.testCount).toBe(1);
        suite(omitConditional, 'field_3');
        expect(suite.get().tests.field_3.testCount).toBe(0);
        suite(omitConditional, 'field_4');
        expect(suite.get().tests.field_4.testCount).toBe(0);
        expect(cb1).toHaveBeenCalledTimes(1);
        expect(cb2).toHaveBeenCalledTimes(1);
        expect(cb3).toHaveBeenCalledTimes(0);
        expect(cb4).toHaveBeenCalledTimes(0);
        expect(cb5).toHaveBeenCalledTimes(0);
        suite(omitConditional);
        expect(cb1).toHaveBeenCalledTimes(2);
        expect(cb2).toHaveBeenCalledTimes(2);
        expect(cb3).toHaveBeenCalledTimes(0);
        expect(cb4).toHaveBeenCalledTimes(0);
        expect(cb5).toHaveBeenCalledTimes(0);
        expect(suite.get()).toMatchSnapshot();
      });

      it('Should consider the suite as valid even without the omitted tests', () => {
        expect(suite.get().isValid()).toBe(false);
        suite(omitConditional, 'field_1');
        expect(suite.get().isValid()).toBe(false);
        suite(omitConditional, 'field_2');
        expect(suite.get().isValid()).toBe(false);
        allFieldsPass = true;
        suite(omitConditional, 'field_2');
        expect(suite.get().tests.field_1.testCount).toBe(1);
        expect(suite.get().tests.field_2.testCount).toBe(1);
        expect(suite.get().tests.field_3.testCount).toBe(0);
        expect(suite.get().tests.field_4.testCount).toBe(0);
        expect(suite.get().isValid()).toBe(true);
      });

      it('Should skip and not run omitted fields when no filter provided', () => {
        suite(omitConditional);
        expect(suite.get().tests.field_1.testCount).toBe(1);
        expect(suite.get().tests.field_2.testCount).toBe(1);
        expect(suite.get().tests.field_3.testCount).toBe(0);
        expect(suite.get().tests.field_4.testCount).toBe(0);
        expect(suite.get()).toMatchSnapshot();
      });
    });
  });

  describe('When the conditional changes between runs', () => {
    it('Should omit previously run fields if changes to `true`', () => {
      suite(false, 'field_1');
      expect(suite.get().tests.field_1.testCount).toBe(2);
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb3).toHaveBeenCalledTimes(1);
      suite(true, 'field_1');
      expect(suite.get().tests.field_1.testCount).toBe(1);
      expect(cb1).toHaveBeenCalledTimes(2);
      expect(cb3).toHaveBeenCalledTimes(1);
    });

    it('Should run fields that were previously omitted when changing to `false`', () => {
      suite(true, 'field_3');
      expect(suite.get().tests.field_3.testCount).toBe(0);
      expect(cb4).toHaveBeenCalledTimes(0);
      suite(false, 'field_3');
      expect(suite.get().tests.field_3.testCount).toBe(1);
      expect(cb4).toHaveBeenCalledTimes(1);
    });
  });

  describe('nested calls', () => {
    let suite;

    describe('omitted in non-omitted', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.omitWhen(false, () => {
            vest.test('outer', () => false);

            vest.omitWhen(true, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite();
      });
      it('Should run `outer` and omit `inner`', () => {
        expect(suite.get().testCount).toBe(1);
        expect(suite.get().hasErrors('outer')).toBe(true);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });

    describe('omitted in omitted', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.omitWhen(true, () => {
            vest.test('outer', () => false);

            vest.omitWhen(true, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite();
      });
      it('Should omit both `outer` and `inner`', () => {
        expect(suite.get().testCount).toBe(0);
        expect(suite.get().hasErrors('outer')).toBe(false);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });
    describe('non-omitted in omitted', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.omitWhen(true, () => {
            vest.test('outer', () => false);

            vest.omitWhen(false, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite();
      });
      it('Should omit both', () => {
        expect(suite.get().testCount).toBe(0);
        expect(suite.get().hasErrors('outer')).toBe(false);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });
  });

  describe('When some tests of the same field are inside omitWhen and some not', () => {
    it('Should mark the field as invalid when failing', () => {
      const res = vest.create(() => {
        vest.test('f1', () => false);

        vest.omitWhen(true, () => {
          vest.test('f1', () => false);
        });
      })();
      expect(res.isValid()).toBe(false);
      expect(res.isValid('f1')).toBe(false);
    });
  });
});
