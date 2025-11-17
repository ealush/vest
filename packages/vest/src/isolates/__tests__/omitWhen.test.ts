import { TTestSuite } from '../../testUtils/TVestMock';
import { Maybe } from 'vest-utils';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import * as vest from '../../vest';
import { omitWhen, only } from '../../vest';

describe('omitWhen', () => {
  let suite: TTestSuite;
  let cb1 = vi.fn(),
    cb2 = vi.fn(),
    cb3 = vi.fn(),
    cb4 = vi.fn(),
    cb5 = vi.fn(),
    allFieldsPass: Maybe<boolean>;

  beforeEach(() => {
    cb1 = vi.fn();
    cb2 = vi.fn(() => (allFieldsPass ? undefined : false));
    cb3 = vi.fn(() => (allFieldsPass ? undefined : false));
    cb4 = vi.fn(() => (allFieldsPass ? undefined : false));
    cb5 = vi.fn();

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

  describe('when conditional is falsy', () => {
    describe.each([
      ['boolean conditional', false],
      ['function conditional', () => false],
    ])('%s', (_, omitConditional) => {
      it('should run tests normally', () => {
        suite.run(omitConditional, 'field_1');
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
        suite.run(omitConditional, 'field_4');
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

      it('should include all fields inside the omitWhen block in the result object', () => {
        suite.run(omitConditional, 'field_1');
        expect(suite.get().tests.field_1).toBeDefined();
        expect(suite.get().tests.field_3).toBeDefined();
        expect(suite.get().tests.field_4).toBeDefined();
        expect(suite.get().tests).toMatchSnapshot();
      });

      it('should retain normal isValid functionality', () => {
        expect(suite.get().isValid()).toBe(false);
        suite.run(omitConditional, 'field_1');
        expect(suite.get().isValid()).toBe(false);
        allFieldsPass = true;
        suite.run(omitConditional);
        expect(suite.get().isValid()).toBe(true);
      });
    });
  });

  describe('when conditional is truthy', () => {
    describe.each([
      ['boolean conditional', true],
      ['function conditional', () => true],
    ])('%s', (_, omitConditional) => {
      it('should avoid running the omitted tests', () => {
        suite.run(omitConditional, 'field_1');
        expect(suite.get().tests.field_1.testCount).toBe(1);
        suite.run(omitConditional, 'field_2');
        expect(suite.get().tests.field_2.testCount).toBe(1);
        suite.run(omitConditional, 'field_3');
        expect(suite.get().tests.field_3.testCount).toBe(0);
        suite.run(omitConditional, 'field_4');
        expect(suite.get().tests.field_4.testCount).toBe(0);
        expect(cb1).toHaveBeenCalledTimes(1);
        expect(cb2).toHaveBeenCalledTimes(1);
        expect(cb3).toHaveBeenCalledTimes(0);
        expect(cb4).toHaveBeenCalledTimes(0);
        expect(cb5).toHaveBeenCalledTimes(0);
        suite.run(omitConditional);
        expect(cb1).toHaveBeenCalledTimes(2);
        expect(cb2).toHaveBeenCalledTimes(2);
        expect(cb3).toHaveBeenCalledTimes(0);
        expect(cb4).toHaveBeenCalledTimes(0);
        expect(cb5).toHaveBeenCalledTimes(0);
        expect(suite.get()).toMatchSnapshot();
      });

      it('should consider the suite valid even without the omitted tests', () => {
        expect(suite.get().isValid()).toBe(false);
        suite.run(omitConditional, 'field_1');
        expect(suite.get().isValid()).toBe(false);
        suite.run(omitConditional, 'field_2');
        expect(suite.get().isValid()).toBe(false);
        allFieldsPass = true;
        suite.run(omitConditional, 'field_2');
        expect(suite.get().tests.field_1.testCount).toBe(1);
        expect(suite.get().tests.field_2.testCount).toBe(1);
        expect(suite.get().tests.field_3.testCount).toBe(0);
        expect(suite.get().tests.field_4.testCount).toBe(0);

        expect(suite.get().isValid()).toBe(true);
      });

      it('should skip and not run omitted fields when no field filter is provided', () => {
        suite.run(omitConditional);
        expect(suite.get().tests.field_1.testCount).toBe(1);
        expect(suite.get().tests.field_2.testCount).toBe(1);
        expect(suite.get().tests.field_3.testCount).toBe(0);
        expect(suite.get().tests.field_4.testCount).toBe(0);
        expect(suite.get()).toMatchSnapshot();
      });
    });
  });

  describe('when the conditional changes between runs', () => {
    it('should omit previously run fields when changing to true', () => {
      suite.run(false, 'field_1');
      expect(suite.get().tests.field_1.testCount).toBe(2);
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb3).toHaveBeenCalledTimes(1);
      suite.run(true, 'field_1');
      expect(suite.get().tests.field_1.testCount).toBe(1);
      expect(cb1).toHaveBeenCalledTimes(2);
      expect(cb3).toHaveBeenCalledTimes(1);
    });

    it('should run fields that were previously omitted when changing to false', () => {
      suite.run(true, 'field_3');
      expect(suite.get().tests.field_3.testCount).toBe(0);
      expect(cb4).toHaveBeenCalledTimes(0);
      suite.run(false, 'field_3');
      expect(suite.get().tests.field_3.testCount).toBe(1);
      expect(cb4).toHaveBeenCalledTimes(1);
    });
  });

  describe('nested calls', () => {
    let suite: TTestSuite;

    describe('omitted inside non-omitted', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.omitWhen(false, () => {
            vest.test('outer', () => false);

            vest.omitWhen(true, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite.run();
      });
      it('should run outer and omit inner', () => {
        expect(suite.get().testCount).toBe(1);
        expect(suite.get().hasErrors('outer')).toBe(true);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });

    describe('omitted inside omitted', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.omitWhen(true, () => {
            vest.test('outer', () => false);

            vest.omitWhen(true, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite.run();
      });
      it('should omit both outer and inner', () => {
        expect(suite.get().testCount).toBe(0);
        expect(suite.get().hasErrors('outer')).toBe(false);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });
    describe('non-omitted inside omitted', () => {
      beforeEach(() => {
        suite = vest.create(() => {
          vest.omitWhen(true, () => {
            vest.test('outer', () => false);

            vest.omitWhen(false, () => {
              vest.test('inner', () => false);
            });
          });
        });
        suite.run();
      });
      it('should omit both outer and inner tests', () => {
        expect(suite.get().testCount).toBe(0);
        expect(suite.get().hasErrors('outer')).toBe(false);
        expect(suite.get().hasErrors('inner')).toBe(false);
      });
    });
  });

  describe('mixed: some tests of a field are inside omitWhen and some not', () => {
    it('should mark the field invalid when any test fails even if others are omitted', () => {
      const res = vest
        .create(() => {
          vest.test('f1', () => false);

          vest.omitWhen(true, () => {
            vest.test('f1', () => false);
          });
        })
        .run();
      expect(res.isValid()).toBe(false);
      expect(res.isValid('f1')).toBe(false);
    });
  });
});
