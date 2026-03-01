import { describe, expect, it, vi } from 'vitest';
import wait from 'wait';

import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import { dummyTest } from '../../../testUtils/testDummy';
import * as vest from '../../../vest';

describe('afterField', () => {
  describe('Runtime behavior', () => {
    describe('When no async tests for the field', () => {
      it('should call the afterField callback immediately once', async () => {
        const afterCallback = vi.fn();

        const suite = vest.create(() => {
          dummyTest.passing('field_1');
          dummyTest.passing('field_1');
          dummyTest.failing('field_2');
        });

        const res = suite
          .afterField('field_1' as TFieldName, afterCallback)
          .run();

        expect(afterCallback).toHaveBeenCalledOnce();
        expect(afterCallback.mock.calls[0][0]).toEqual(suite.get());

        await res;
        expect(afterCallback).toHaveBeenCalledOnce();
        expect(afterCallback.mock.calls[0][0]).toEqual(suite.get());
      });
    });

    describe('When there are async tests for the field', () => {
      it('Should only run field callbacks for completed tests', async () => {
        const control = vi.fn();
        const suite = vest.create(() => {
          vest.test('field_1' as TFieldName, async () => {
            await wait(100);
          });
          vest.test('field_2' as TFieldName, () => {});
          vest.test('field_3' as TFieldName, async () => {
            await wait(50);
          });
        });

        const cb2 = vi.fn((res: ReturnType<typeof suite.get>) => {
          expect(res).toEqual(suite.get());
          control();
        });
        const cb3 = vi.fn((res: ReturnType<typeof suite.get>) => {
          expect(res).toEqual(suite.get());
          control();
        });

        suite
          .afterField('field_2' as TFieldName, cb2)
          .afterField('field_3' as TFieldName, cb3)
          .run();

        expect(cb2).toHaveBeenCalled();
        expect(cb2.mock.calls[0][0]).toEqual(suite.get());
        expect(control).toHaveBeenCalledTimes(1);
        expect(cb3).not.toHaveBeenCalled();

        await wait(55);
        expect(cb3).toHaveBeenCalled();
        expect(cb3.mock.calls[0][0]).toEqual(suite.get());
        expect(control).toHaveBeenCalledTimes(2);
      });
    });

    describe('When the test run was canceled', () => {
      it('Should not run the field callbacks of the canceled run', async () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        const cb3 = vi.fn();

        const suite = vest.create(() => {
          vest.test('field_1' as TFieldName, async () => {
            await wait(10);
          });
          vest.test('field_2' as TFieldName, () => {});
        });

        suite
          .afterField('field_1' as TFieldName, cb1)
          .afterField('field_1' as TFieldName, cb2)
          .afterField('field_1' as TFieldName, cb3)
          .run();

        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();

        // Calling run again cancels the pending async tests from the previous run
        suite.run();

        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).not.toHaveBeenCalled();
        expect(cb3).not.toHaveBeenCalled();
      });
    });
  });

  describe('Typing examples', () => {
    it('Pattern 1: Escape hatch — create<null>()', () => {
      const suite = vest.create<null>((_data: any) => {
        vest.test('dynamic_field', () => {});
      });

      // Suite-level APIs all accept any string
      suite.afterField('dynamic_field', () => {});
      suite.afterField('anything_else', () => {});
    });

    it('Pattern 2: Config generic — create<{ fields; groups }>()', () => {
      const suite = vest.create<{
        fields: 'username' | 'password';
        groups: 'auth';
      }>((_data: unknown) => {
        vest.test('username', () => {});
      });

      suite.afterField('password', () => {});
      suite.afterField('username', () => {});

      // @ts-expect-error - invalid field for suite.afterField
      suite.afterField('invalid', () => {});
    });

    it('Pattern 3: Schema inferred — create(cb, schema)', () => {
      const schema = vest.enforce.shape({
        firstName: vest.enforce.isString(),
        age: vest.enforce.isNumber(),
      });

      const suite = vest.create(data => {
        vest.test('firstName', () => {
          vest.enforce(data.firstName).isNotBlank();
        });
      }, schema);

      suite.afterField('age', () => {});
      suite.afterField('firstName', () => {
        const result = suite.get();
        result.hasErrors('firstName');
        result.getErrors('age');

        // @ts-expect-error - unknown field
        result.hasErrors('invalid');
      });

      // @ts-expect-error - unknown field for suite.afterField
      suite.afterField('unknown', () => {});
    });

    it('Pattern 4: Untyped fallback — create(cb)', () => {
      const suite = vest.create((_data: any) => {
        vest.test('whatever', () => {});
      });

      suite.afterField('whatever', () => {});
      suite.afterField('other', () => {});
    });
  });
});
