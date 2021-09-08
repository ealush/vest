import faker from 'faker';

import { create, test, warn } from 'vest';

let testObject;

describe("Test Vest's `test` function", () => {
  describe('test callbacks', () => {
    describe('Warn hook', () => {
      it('Should be marked as warning when the warn hook gets called', () => {
        create(() => {
          testObject = test(faker.random.word(), faker.lorem.sentence(), () => {
            warn();
          });
        })();
        expect(testObject.warns).toBe(true);
      });
    });

    describe('Sync', () => {
      it('Should be marked as failed after a thrown error', () => {
        create(() => {
          testObject = test(faker.random.word(), faker.lorem.sentence(), () => {
            throw new Error();
          });
        })();
        expect(testObject.status).toBe('FAILED');
        expect(testObject == false).toBe(true); //eslint-disable-line
      });

      it('Should be marked as failed for an explicit false return', () => {
        create(() => {
          test(faker.random.word(), faker.lorem.sentence(), () => false);
        })();
        expect(testObject.status).toBe('FAILED');
        expect(testObject == false).toBe(true); //eslint-disable-line
      });

      describe('Thrown with a message', () => {
        describe('When field has a message', () => {
          it("Should use field's own message", () => {
            const res = create(() => {
              test('field_with_message', 'some_field_message', () => {
                failWithString();
              });
              test('warning_field_with_message', 'some_field_message', () => {
                warn();
                failWithString();
              });
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
          it('Should use message from thrown error', () => {
            const res = create(() => {
              test('field_without_message', () => {
                failWithString();
              });
              test('warning_field_without_message', () => {
                warn();
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
        new Promise<void>(done => {
          create(() => {
            testObject = test(
              faker.random.word(),
              faker.lorem.sentence(),
              () =>
                new Promise((_, reject) => {
                  expect(testObject.status).not.toBe('FAILED');
                  setTimeout(reject, 300);
                })
            );
            expect(testObject.status).not.toBe('FAILED');
            setTimeout(() => {
              expect(testObject.status).toBe('FAILED');
              done();
            }, 310);
          })();
        }));
    });
  });
});

function failWithString(msg?: string) {
  throw msg ?? 'I fail with a message';
}
