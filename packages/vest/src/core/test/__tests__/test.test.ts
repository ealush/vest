import { faker } from '@faker-js/faker';
import { VestTest } from 'VestTest';
import { text } from 'vest-utils';
import { IsolateSerializer } from 'vestjs-runtime';

import { TestPromise } from '../../../testUtils/testPromise';

import { ErrorStrings } from 'ErrorStrings';
import { TIsolateTest } from 'IsolateTest';
import { enforce } from 'vest';
import * as vest from 'vest';

let testObject: TIsolateTest;

describe("Test Vest's `test` function", () => {
  describe('test callbacks', () => {
    describe('Warn hook', () => {
      it('Should be marked as warning when the warn hook gets called', () => {
        vest.create(() => {
          testObject = vest.test(
            faker.random.word(),
            faker.lorem.sentence(),
            () => {
              vest.warn();
            }
          );
        })();
        expect(VestTest.warns(testObject)).toBe(true);
      });
    });

    describe('Sync', () => {
      it('Should be marked as failed after a thrown error', () => {
        vest.create(() => {
          testObject = vest.test(
            faker.random.word(),
            faker.lorem.sentence(),
            () => {
              throw new Error();
            }
          );
        })();
        expect(VestTest.isFailing(testObject)).toBe(true);
      });

      it('Should be marked as failed for an explicit false return', () => {
        vest.create(() => {
          vest.test(faker.random.word(), faker.lorem.sentence(), () => false);
        })();
        expect(VestTest.isFailing(testObject)).toBe(true);
      });

      describe('Thrown with a message', () => {
        describe('When field has a message', () => {
          it("Should use field's own message", () => {
            const res = vest.create(() => {
              vest.test('field_with_message', 'some_field_message', () => {
                failWithString();
              });
              vest.test(
                'warning_field_with_message',
                'some_field_message',
                () => {
                  vest.warn();
                  failWithString();
                }
              );
            })();

            expect(res.getErrors('field_with_message')).toEqual([
              'some_field_message',
            ]);
            expect(res.tests['field_with_message'].errors).toEqual([
              'some_field_message',
            ]);
            expect(res.getWarnings('warning_field_with_message')).toEqual([
              'some_field_message',
            ]);
            expect(res.tests['warning_field_with_message'].warnings).toEqual([
              'some_field_message',
            ]);
          });
        });
        describe('When field does not have a message', () => {
          it('Should use message from enforce().message()', () => {
            const res = vest.create(() => {
              vest.test('field_without_message', () => {
                enforce(100).message('some_field_message').equals(0);
              });
            })();

            expect(res.getErrors('field_without_message')).toEqual([
              'some_field_message',
            ]);
          });
          it('Should use message from thrown error', () => {
            const res = vest.create(() => {
              vest.test('field_without_message', () => {
                failWithString();
              });
              vest.test('warning_field_without_message', () => {
                vest.warn();
                failWithString();
              });
            })();

            expect(res.getErrors('field_without_message')).toEqual([
              'I fail with a message',
            ]);
            expect(res.tests['field_without_message'].errors).toEqual([
              'I fail with a message',
            ]);
            expect(res.getWarnings('warning_field_without_message')).toEqual([
              'I fail with a message',
            ]);
            expect(res.tests['warning_field_without_message'].warnings).toEqual(
              ['I fail with a message']
            );
          });
        });
      });
    });

    describe('async', () => {
      it('Should be marked as failed when a returned promise rejects', () =>
        TestPromise(done => {
          vest.create(() => {
            testObject = vest.test(
              faker.random.word(),
              faker.lorem.sentence(),
              () =>
                new Promise((_, reject) => {
                  expect(VestTest.isFailing(testObject)).toBe(false);
                  setTimeout(reject, 300);
                })
            );
            expect(VestTest.isFailing(testObject)).toBe(false);
            setTimeout(() => {
              expect(VestTest.isFailing(testObject)).toBe(true);
              done();
            }, 310);
          })();
        }));
    });
  });

  describe('test params', () => {
    let testObject: TIsolateTest;
    it('creates a test without a message and without a key', () => {
      vest.create(() => {
        testObject = vest.test('field_name', () => undefined);
      })();
      expect(testObject.data.fieldName).toBe('field_name');
      expect(testObject.key).toBeNull();
      expect(testObject.data.message).toBeUndefined();
      expect(testObject).toMatchSnapshot();
    });

    it('creates a test without a key', () => {
      vest.create(() => {
        testObject = vest.test(
          'field_name',
          'failure message',
          () => undefined
        );
      })();
      expect(testObject.data.fieldName).toBe('field_name');
      expect(testObject.key).toBeNull();
      expect(testObject.data.message).toBe('failure message');
      expect(testObject).toMatchSnapshot();
    });

    it('creates a test without a message and with a key', () => {
      vest.create(() => {
        testObject = vest.test('field_name', () => undefined, 'keyboardcat');
      })();
      expect(testObject.data.fieldName).toBe('field_name');
      expect(testObject.key).toBe('keyboardcat');
      expect(testObject.data.message).toBeUndefined();
      expect(testObject).toMatchSnapshot();
    });

    it('creates a test with a message and with a key', () => {
      vest.create(() => {
        testObject = vest.test(
          'field_name',
          'failure message',
          () => undefined,
          'keyboardcat'
        );
      })();
      expect(testObject.data.fieldName).toBe('field_name');
      expect(testObject.key).toBe('keyboardcat');
      expect(testObject.data.message).toBe('failure message');
      expect(IsolateSerializer.serialize(testObject)).toMatchInlineSnapshot(
        `"{"$":"Test","D":{"severity":"error","status":"PASSING","fieldName":"field_name","message":"failure message"},"k":"keyboardcat"}"`
      );
    });

    it('throws when field name is not a string', () => {
      const control = jest.fn();
      vest.create(() => {
        // @ts-ignore
        expect(() => vest.test(undefined, () => undefined)).toThrow(
          text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
            fn_name: 'test',
            param: 'fieldName',
            expected: 'string',
          })
        );
        // @ts-expect-error
        expect(() => vest.test(null, 'error message', () => undefined)).toThrow(
          text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
            fn_name: 'test',
            param: 'fieldName',
            expected: 'string',
          })
        );
        expect(() =>
          // @ts-expect-error
          vest.test(null, 'error message', () => undefined, 'key')
        ).toThrow(
          text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
            fn_name: 'test',
            param: 'fieldName',
            expected: 'string',
          })
        );
        control();
      })();
      expect(control).toHaveBeenCalled();
    });

    it('throws when callback is not a function', () => {
      const control = jest.fn();
      vest.create(() => {
        // @ts-expect-error
        expect(() => vest.test('x')).toThrow(
          text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
            fn_name: 'test',
            param: 'callback',
            expected: 'function',
          })
        );
        // @ts-expect-error
        expect(() => vest.test('x', 'msg', undefined)).toThrow(
          text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
            fn_name: 'test',
            param: 'callback',
            expected: 'function',
          })
        );
        // @ts-expect-error
        expect(() => vest.test('x', 'msg', undefined, 'key')).toThrow(
          text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
            fn_name: 'test',
            param: 'callback',
            expected: 'function',
          })
        );
        control();
      })();
      expect(control).toHaveBeenCalled();
    });
  });
});

function failWithString(msg?: string) {
  throw msg ?? 'I fail with a message';
}
