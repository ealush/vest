import faker from 'faker';

import vest, { create, test, enforce } from 'vest';

let testObject;

describe("Test Vest's `test` function", () => {
  describe('test callbacks', () => {
    describe('Warn hook', () => {
      it('Should be marked as warning when the warn hook gets called', () => {
        create(faker.random.word(), () => {
          testObject = test(faker.random.word(), faker.lorem.sentence(), () => {
            vest.warn();
          });
        })();
        expect(testObject.isWarning).toBe(true);
      });
    });

    describe('Sync', () => {
      it('Should be marked as failed after a thrown error', () => {
        create(faker.random.word(), () => {
          testObject = test(faker.random.word(), faker.lorem.sentence(), () => {
            throw new Error();
          });
        })();
        expect(testObject.failed).toBe(true);
        expect(testObject == false).toBe(true); //eslint-disable-line
      });

      it('Should be marked as failed for an explicit false return', () => {
        create(faker.random.word(), () => {
          test(faker.random.word(), faker.lorem.sentence(), () => false);
        })();
        expect(testObject.failed).toBe(true);
        expect(testObject == false).toBe(true); //eslint-disable-line
      });

      describe('Thrown with a message', () => {
        enforce.extend({
          fail: () => {
            return {
              pass: false,
              message: () => 'I fail with a message',
            };
          },
        });
        describe('When field has a message', () => {
          it("Should use field's own message", () => {
            const res = create(() => {
              test('field_with_message', 'some_field_message', () => {
                enforce().fail();
              });
              test('warning_field_with_message', 'some_field_message', () => {
                vest.warn();
                enforce().fail();
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
                enforce().fail();
              });
              test('warning_field_without_message', () => {
                vest.warn();
                enforce().fail();
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
            expect(
              res.tests['warning_field_without_message'].warnings
            ).toEqual(['I fail with a message']);
          });
        });
      });
    });

    describe('async', () => {
      it('Should be marked as failed when a returned promise rejects', () =>
        new Promise(done => {
          create(faker.random.word(), () => {
            testObject = test(
              faker.random.word(),
              faker.lorem.sentence(),
              () =>
                new Promise((resolve, reject) => {
                  expect(testObject.failed).toBe(false);
                  setTimeout(reject, 300);
                })
            );
            expect(testObject.failed).toBe(false);
            setTimeout(() => {
              expect(testObject.failed).toBe(true);
              done();
            }, 310);
          })();
        }));
    });
  });

  describe('error handling', () => {
    describe('When enforce is returned (not thrown)', () => {
      it('Should continue without failing', () =>
        new Promise(done => {
          create('form_with_enforce', () => {
            try {
              test('field_with_enforce', () => enforce('example').isNotEmpty());
              done();
            } catch {
              /* */
            }
          })();
        }));
    });
  });
});
