import faker from 'faker';
import enforce from 'n4s';

import test from 'test';
import vest from 'vest';

let testObjects;

describe("Test Vest's `test.each` function", () => {
  describe('Sync Tests', () => {
    describe('Basic Functionality', () => {
      it('Should return all test objects correctly', () => {
        vest.create(faker.random.word(), () => {
          testObjects = test.each([[1, 2, 3], [2, 7, 9]])(faker.random.word(), faker.lorem.sentence(), (a, b, c) => {
            enforce(a + b).equals(c);
          });
        })();
        expect(testObjects).toHaveLength(2);
        expect(testObjects[0].failed).toBe(false);
        expect(testObjects[1].failed).toBe(false);
      });

      it('Should mark failed tests as such', () => {
        vest.create(faker.random.word(), () => {
          testObjects = test.each([[5, 5, 10], [1, 4, 10], [2, 7, 9]])(faker.random.word(), faker.lorem.sentence(), (a, b, c) => {
            enforce(a + b).equals(c);
          });
        })();
        expect(testObjects).toHaveLength(3);
        expect(testObjects[0].failed).toBe(false);
        expect(testObjects[1].failed).toBe(true);
        expect(testObjects[2].failed).toBe(false);
      });

      it('Should include function message when fail test uses function statement', () => {
        vest.create(faker.random.word(), () => {
          testObjects = test.each([[5, 4, 10]])(faker.random.word(), (a, b, c) => {
            return `${a} + ${b} != ${c}`;
          }, (a, b, c) => {
            enforce(a + b).equals(c);
          });
        })();
        expect(testObjects).toHaveLength(1);
        expect(testObjects[0].failed).toBe(true);
        expect(testObjects[0].statement).toBe('5 + 4 != 10');
      });

      it('Should work correctly with exclusions', () => {
        const statementFn1 = jest.fn();
        const testFn1 = jest.fn();
        const testFn2 = jest.fn();

        const validate = vest.create(faker.random.word(), () => {
          vest.only('test2');
          test.each([[5, 4, 10]])('test1', statementFn1, testFn1);
          test.each([[5, 4, 10]])('test2', faker.lorem.sentence(), testFn2);
        });
        validate();
        expect(testFn1).not.toHaveBeenCalled();
        expect(statementFn1).toHaveBeenCalled();
        expect(testFn2).toHaveBeenCalled();
      })

      it('Should work correctly with 1d-array', () => {
        vest.create(faker.random.word(), () => {
          testObjects = test.each([1, 2, 3])(faker.random.word(), faker.lorem.sentence(), (a) => {
            enforce(a).greaterThanOrEquals(2);
          });
        })();
        expect(testObjects).toHaveLength(3);
        expect(testObjects[0].failed).toBe(true);
        expect(testObjects[1].failed).toBe(false);
        expect(testObjects[2].failed).toBe(false);
      });
    });
  });

  describe('Async Tests', () => {
    describe('Basic Functionality', () => {
      it('Should finish with no errors', () => {
        new Promise(done => {
          const validate = vest.create(faker.random.word(), () => {
            test.each([[1, 2, 3], [2, 7, 9]])('f1', faker.lorem.sentence(), (a, b, c) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  try {
                    enforce(a + b).equals(c);
                  } catch (_) {
                    reject();
                  }
                  resolve();
                }, 100);
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
        new Promise(done => {
          const validate = vest.create(faker.random.word(), () => {
            test.each([[1, 2, 3], [2, 1, 9]])('f1', (a, b, c) => {
              return `${a} + ${b} != ${c}`;
            }, (a, b, c) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  try {
                    enforce(a + b).equals(c);
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
