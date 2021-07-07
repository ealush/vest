import faker from 'faker';

import test from 'test';
import * as vest from 'vest';

let testObjects;

describe("Test Vest's `test.each` function", () => {
  describe('Sync Tests', () => {
    describe('Basic Functionality', () => {
      it('Should return all test objects correctly', () => {
        vest.create(() => {
          testObjects = test.each([
            [1, 2, 3],
            [2, 7, 9],
          ])(faker.random.word(), faker.lorem.sentence(), (a, b, c) => {
            expect(a + b).toBe(c);
          });
        })();
        expect(testObjects).toHaveLength(2);
        expect(testObjects[0].failed).toBe(false);
        expect(testObjects[1].failed).toBe(false);
      });

      it('Should mark failed tests as such', () => {
        vest.create(() => {
          testObjects = test.each([
            [5, 5, 10],
            [1, 4, 10],
            [2, 7, 9],
          ])(faker.random.word(), faker.lorem.sentence(), (a, b, c) => {
            expect(a + b).toBe(c);
          });
        })();
        expect(testObjects).toHaveLength(3);
        expect(testObjects[0].failed).toBe(false);
        expect(testObjects[1].failed).toBe(true);
        expect(testObjects[2].failed).toBe(false);
      });

      it('Should include function message when fail test uses function statement', () => {
        vest.create(() => {
          testObjects = test.each([[5, 4, 10]])(
            faker.random.word(),
            (a, b, c) => {
              return `${a} + ${b} != ${c}`;
            },
            (a, b, c) => {
              expect(a + b).toBe(c);
            }
          );
        })();
        expect(testObjects).toHaveLength(1);
        expect(testObjects[0].failed).toBe(true);
        expect(testObjects[0].message).toBe('5 + 4 != 10');
      });

      it('Should work correctly with exclusions', () => {
        const statementFn1 = jest.fn();
        const testFn1 = jest.fn();
        const testFn2 = jest.fn();

        const res = vest.create(() => {
          vest.only('test2');
          test.each([[5, 4, 10]])('test1', statementFn1, testFn1);
          test.each([[5, 4, 10]])('test2', faker.lorem.sentence(), testFn2);
        })();
        expect(testFn1).not.toHaveBeenCalled(); // skippped field
        expect(res.tests.test1.testCount).toBe(0); // skippped field
        expect(statementFn1).toHaveBeenCalled();
        expect(testFn2).toHaveBeenCalled();
        expect(res.tests.test2).toBeDefined();
      });

      it('Should work correctly with 1d-array', () => {
        const res = vest.create(() => {
          testObjects = test.each([2, 1, 3])(
            faker.random.word(),
            faker.lorem.sentence(),
            a => {
              if (a < 2) {
                throw Error();
              }
            }
          );
        })();
        expect(testObjects).toHaveLength(3);
        expect(testObjects[0].failed).toBe(false);
        /* Since fieldName is shared between all result, if one fails we expect all to fail */
        expect(res.hasErrors(testObjects[0].fieldName)).toBe(true);
        expect(testObjects[1].failed).toBe(true);
        expect(res.hasErrors(testObjects[1].fieldName)).toBe(true);
        expect(testObjects[2].failed).toBe(false);
        expect(res.hasErrors(testObjects[2].fieldName)).toBe(true);
      });

      it('Should work with fieldName function', () => {
        const res = vest.create(() => {
          testObjects = test.each([2, 1, 3])(
            a => `field${a}`,
            faker.lorem.sentence(),
            a => {
              if (a < 2) {
                throw new Error();
              }
            }
          );
        })();
        expect(testObjects).toHaveLength(3);
        expect(testObjects[0].failed).toBe(false);
        expect(testObjects[0].fieldName).toBe('field2');
        expect(res.hasErrors(testObjects[0].fieldName)).toBe(false);
        expect(testObjects[1].failed).toBe(true);
        expect(testObjects[1].fieldName).toBe('field1');
        expect(res.hasErrors(testObjects[1].fieldName)).toBe(true);
        expect(testObjects[2].failed).toBe(false);
        expect(testObjects[2].fieldName).toBe('field3');
        expect(res.hasErrors(testObjects[2].fieldName)).toBe(false);
      });
    });
  });

  describe('Async Tests', () => {
    describe('Basic Functionality', () => {
      it('Should finish with no errors', () => {
        new Promise<void>(done => {
          const validate = vest.create(() => {
            test.each([
              [1, 2, 3],
              [2, 7, 9],
            ])(
              'f1',
              faker.lorem.sentence(),
              () =>
                new Promise<void>(resolve => {
                  setTimeout(resolve, 100);
                })
            );
          });
          validate().done(res => {
            expect(res.hasErrors('f1')).toBe(false);
            done();
          });
        });
      });

      it('Should have errors when finished', () => {
        new Promise<void>(done => {
          const validate = vest.create(() => {
            test.each([
              [1, 2, 3],
              [2, 1, 9],
            ])(
              'f1',
              (a, b, c) => {
                return `${a} + ${b} != ${c}`;
              },
              (a, b, c) =>
                new Promise<void>((resolve, reject) => {
                  setTimeout(() => {
                    try {
                      expect(a + b).toBe(c);
                    } catch (_) {
                      reject();
                    }
                    resolve();
                  }, 100);
                })
            );
          });
          validate().done(res => {
            expect(res.hasErrors('f1')).toBe(true);
            const errors = res.getErrors('f1');
            expect(errors).toHaveLength(1);
            expect(errors[0]).toBe('2 + 1 != 9');
            done();
          });
        });
      });
    });
  });
});
