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
        expect(testObjects[0].status).not.toBe('FAILED');
        expect(testObjects[1].status).not.toBe('FAILED');
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
        expect(testObjects[0].status).not.toBe('FAILED');
        expect(testObjects[1].status).toBe('FAILED');
        expect(testObjects[2].status).not.toBe('FAILED');
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
        expect(testObjects[0].status).toBe('FAILED');
        expect(testObjects[0].message).toBe('5 + 4 != 10');
      });

      it('Should work correctly with exclusions', () => {
        const statementFn1 = jest.fn();
        const testFn1 = jest.fn();
        const testFn2 = jest.fn();

        const res = vest.create(() => {
          vest.only('test2');
          test.each([[1, 2, 3]])('test1', statementFn1, testFn1);
          test.each([[4, 5, 6]])('test2', faker.lorem.sentence(), testFn2);
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
        expect(testObjects[0].status).not.toBe('FAILED');
        /* Since fieldName is shared between all result, if one fails we expect all to fail */
        expect(res.hasErrors(testObjects[0].fieldName)).toBe(true);
        expect(testObjects[1].status).toBe('FAILED');
        expect(res.hasErrors(testObjects[1].fieldName)).toBe(true);
        expect(testObjects[2].status).not.toBe('FAILED');
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
        expect(testObjects[0].status).not.toBe('FAILED');
        expect(testObjects[0].fieldName).toBe('field2');
        expect(res.hasErrors(testObjects[0].fieldName)).toBe(false);
        expect(testObjects[1].status).toBe('FAILED');
        expect(testObjects[1].fieldName).toBe('field1');
        expect(res.hasErrors(testObjects[1].fieldName)).toBe(true);
        expect(testObjects[2].status).not.toBe('FAILED');
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

  describe('Error handling', () => {
    describe('When field count change', () => {
      let counter;
      let persist_1 = jest.fn(() => false),
        persist_2 = jest.fn(() => false),
        persist_3 = jest.fn(() => false);

      beforeEach(() => {
        counter = 1;
        persist_1 = jest.fn(() => false);
        persist_2 = jest.fn(() => false);
        persist_3 = jest.fn(() => false);
      });

      it('Should contain the change within the "each" block', () => {
        const suite = vest.create(() => {
          test.each(Array.from({ length: 2 * counter }, (_, v) => v * counter))(
            c => `f${c}`,
            faker.lorem.sentence(),
            () => false
          );

          vest.skipWhen(counter == 2, () => {
            test('persist_1', persist_1);
            test('persist_2', persist_2);
            test('persist_3', persist_3);
          });

          counter++;
        });

        expect(persist_1).toHaveBeenCalledTimes(0);
        expect(persist_2).toHaveBeenCalledTimes(0);
        expect(persist_3).toHaveBeenCalledTimes(0);
        const resA = suite();

        // Called first time
        expect(persist_1).toHaveBeenCalledTimes(1);
        expect(persist_2).toHaveBeenCalledTimes(1);
        expect(persist_3).toHaveBeenCalledTimes(1);

        const resB = suite();

        // Should not call again!
        expect(persist_1).toHaveBeenCalledTimes(1);
        expect(persist_2).toHaveBeenCalledTimes(1);
        expect(persist_3).toHaveBeenCalledTimes(1);
        expect(resA.tests.persist_1).toEqual(resB.tests.persist_1);
        expect(resA.tests.persist_2).toEqual(resB.tests.persist_2);
        expect(resA.tests.persist_3).toEqual(resB.tests.persist_3);
      });

      it('Should remove outdated assertions', () => {
        const suite = vest.create(() => {
          test.each(
            Array.from({ length: 2 * counter }, (_, i) => (i + 1) * counter)
          )(
            c => `f${c}`,
            () => false
          );
          counter++;
        });

        const resA = suite();
        expect(resA.tests.f1).toBeDefined();
        expect(resA.tests.f2).toBeDefined();
        expect(resA.tests.f4).toBeUndefined();
        expect(resA.tests.f6).toBeUndefined();
        expect(resA.tests.f8).toBeUndefined();

        const resB = suite();
        expect(resB.tests.f1).toBeUndefined();
        expect(resB.tests.f2).toBeDefined();
        expect(resB.tests.f4).toBeDefined();
        expect(resB.tests.f6).toBeDefined();
        expect(resB.tests.f8).toBeDefined();
        expect(resA).not.toEqual(resB);
        expect(resA.tests).toMatchInlineSnapshot(`
          Object {
            "f1": Object {
              "errorCount": 1,
              "testCount": 1,
              "warnCount": 0,
            },
            "f2": Object {
              "errorCount": 1,
              "testCount": 1,
              "warnCount": 0,
            },
          }
        `);
        expect(resB.tests).toMatchInlineSnapshot(`
          Object {
            "f2": Object {
              "errorCount": 1,
              "testCount": 1,
              "warnCount": 0,
            },
            "f4": Object {
              "errorCount": 1,
              "testCount": 1,
              "warnCount": 0,
            },
            "f6": Object {
              "errorCount": 1,
              "testCount": 1,
              "warnCount": 0,
            },
            "f8": Object {
              "errorCount": 1,
              "testCount": 1,
              "warnCount": 0,
            },
          }
        `);
      });

      it('Should not leak between each blocks', () => {
        const suite = vest.create(() => {
          test.each([1, 2, 3].concat(counter === 2 ? [4, 5, 6] : []))(
            c => `f${c}`,
            () => false
          );

          vest.skipWhen(counter === 2, () => {
            test.each([7, 8, 9])(c => `f${c}`, persist_1);
          });
          counter++;
        });

        const resA = suite();
        expect(suite.get().tests.f1).toBeDefined();
        expect(suite.get().tests.f2).toBeDefined();
        expect(suite.get().tests.f3).toBeDefined();

        // These three only exist in the second run
        expect(suite.get().tests.f4).toBeUndefined();
        expect(suite.get().tests.f5).toBeUndefined();
        expect(suite.get().tests.f6).toBeUndefined();

        expect(suite.get().tests.f7).toBeDefined();
        expect(suite.get().tests.f8).toBeDefined();
        expect(suite.get().tests.f9).toBeDefined();

        // it is the same callback for all three tests in the second  block
        expect(persist_1).toHaveBeenCalledTimes(3);

        const resB = suite();
        expect(suite.get().tests.f1).toBeDefined();
        expect(suite.get().tests.f2).toBeDefined();
        expect(suite.get().tests.f3).toBeDefined();
        expect(suite.get().tests.f4).toBeDefined();
        expect(suite.get().tests.f5).toBeDefined();
        expect(suite.get().tests.f6).toBeDefined();
        expect(suite.get().tests.f7).toBeDefined();
        expect(suite.get().tests.f8).toBeDefined();
        expect(suite.get().tests.f9).toBeDefined();

        // This proves they weren't called again and still got preserved
        expect(persist_1).toHaveBeenCalledTimes(3);

        // The result was unchanged even though the field did not run twice.
        expect(resA.tests.f7).toEqual(resB.tests.f7);
        expect(resA.tests.f8).toEqual(resB.tests.f8);
        expect(resA.tests.f9).toEqual(resB.tests.f9);
      });
    });
  });
});
