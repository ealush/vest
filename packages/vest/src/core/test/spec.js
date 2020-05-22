import faker from 'faker';
import runSpec from '../../../testUtils/runSpec';

runSpec(vest => {
  const { validate, test } = vest;
  describe("Test Vest's `test` function", () => {
    describe('test callbacks', () => {
      describe('Warn hook', () => {
        it('Should be marked as warning when the warn hook gets called', () => {
          validate(faker.random.word(), () => {
            const testObject = test(
              faker.random.word(),
              faker.lorem.sentence(),
              () => {
                vest.warn();
              }
            );
            expect(testObject.isWarning).toBe(true);
          });
        });
      });

      describe('Sync', () => {
        it('Should be marked as failed after a thrown error', () => {
          validate(faker.random.word(), () => {
            const testObject = test(
              faker.random.word(),
              faker.lorem.sentence(),
              () => {
                throw new Error();
              }
            );
            expect(testObject.failed).toBe(true);
            expect(testObject == false).toBe(true); //eslint-disable-line
          });
        });

        it('Should be marked as failed for an explicit false return', () => {
          validate(faker.random.word(), () => {
            const testObject = test(
              faker.random.word(),
              faker.lorem.sentence(),
              () => false
            );
            expect(testObject.failed).toBe(true);
            expect(testObject == false).toBe(true); //eslint-disable-line
          });
        });
      });

      describe('async', () => {
        it('Should be marked as failed when a returned promise rejects', () =>
          new Promise(done => {
            validate(faker.random.word(), () => {
              const testObject = test(
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
            });
          }));
      });
    });
  });
});
