import { TTestSuite } from 'testUtils/TVestMock';
import wait from 'wait';

import { dummyTest } from '../../testUtils/testDummy';

import { Modes } from 'Modes';
import { create, only, group, mode } from 'vest';
import * as Vest from 'vest';

describe('mode', () => {
  let suite: TTestSuite;

  describe('Eager (default)', () => {
    describe('When tests fail', () => {
      beforeEach(() => {
        suite = create(include => {
          only(include);

          dummyTest.failing('field_1', 'first-of-field_1');
          dummyTest.failing('field_1', 'second-of-field_1'); // Should not run
          dummyTest.failing('field_2', 'first-of-field_2');
          dummyTest.failing('field_2', 'second-of-field_2'); // Should not run
          dummyTest.failing('field_3', 'first-of-field_3');
          dummyTest.failing('field_3', 'second-of-field_3'); // Should not run
        });
      });

      it('Should fail fast for every failing field', () => {
        expect(suite.get().testCount).toBe(0); // sanity
        suite();
        expect(suite.get().testCount).toBe(3);
        expect(suite.get().errorCount).toBe(3);
        expect(suite.get().getErrors('field_1')).toEqual(['first-of-field_1']);
        expect(suite.get().getErrors('field_2')).toEqual(['first-of-field_2']);
        expect(suite.get().getErrors('field_3')).toEqual(['first-of-field_3']);
      });

      describe('async tests', () => {
        describe('When mixed', () => {
          describe('Failing sync test before the async tests', () => {
            it('should stop execution after the first failing sync test', () =>
              new Promise<void>(resolve => {
                const suite = Vest.create(() => {
                  Vest.test('t1', 'f0', () => true);
                  Vest.test('t1', 'f1', () => false);
                  Vest.test('t1', 'f2', async () => {
                    await wait(150);
                    throw new Error();
                  });
                });
                suite().done(res => {
                  expect(res.getErrors()).toEqual({
                    t1: ['f1'],
                  });
                  resolve();
                });
              }));
          });
          describe('Failing async test before the sync tests', () => {
            it('should stop execution after the first failing sync test', () =>
              new Promise<void>(resolve => {
                const suite = Vest.create(() => {
                  Vest.test('t1', 'f0', async () => {
                    await wait(150);
                    throw new Error();
                  });
                  Vest.test('t1', 'f1', () => false);
                  Vest.test('t1', 'f2', () => true);
                });
                suite().done(res => {
                  expect(res.getErrors()).toEqual({
                    t1: ['f0', 'f1'],
                  });
                  resolve();
                });
              }));
          });
        });

        describe('Only async tests', () => {
          it('should run all tests', () =>
            new Promise<void>(resolve => {
              const suite = Vest.create(() => {
                Vest.test('async_1', 'f1', async () => {
                  await wait(100);
                  throw new Error();
                });
                Vest.test('async_1', 'f2', async () => {
                  await wait(150);
                  throw new Error();
                });
              });
              suite().done(res => {
                expect(res.getErrors()).toEqual({
                  async_1: ['f1', 'f2'],
                });
                resolve();
              });
            }));
        });
      });

      describe('When test is `only`ed', () => {
        it('Should fail fast for failing field', () => {
          suite('field_1');
          expect(suite.get().testCount).toBe(1);
          expect(suite.get().errorCount).toBe(1);
          expect(suite.get().getErrors('field_1')).toEqual([
            'first-of-field_1',
          ]);
        });
      });

      describe('When test is in a group', () => {
        beforeEach(() => {
          suite = create(() => {
            group('group_1', () => {
              dummyTest.failing('field_1', 'first-of-field_1');
            });
            dummyTest.failing('field_1', 'second-of-field_1');
          });
        });
        it('Should fail fast for failing field', () => {
          suite();
          expect(suite.get().testCount).toBe(1);
          expect(suite.get().errorCount).toBe(1);
          expect(suite.get().getErrors('field_1')).toEqual([
            'first-of-field_1',
          ]);
        });
      });
    });

    describe('When tests pass', () => {
      beforeEach(() => {
        suite = create(() => {
          dummyTest.passing('field_1', 'first-of-field_1');
          dummyTest.failing('field_1', 'second-of-field_1');
          dummyTest.passing('field_2', 'first-of-field_2');
          dummyTest.failing('field_2', 'second-of-field_2');
          dummyTest.passing('field_3', 'first-of-field_3');
          dummyTest.failing('field_3', 'second-of-field_3');
        });
      });

      it('Should fail fast for every failing field', () => {
        expect(suite.get().testCount).toBe(0); // sanity
        suite();
        expect(suite.get().testCount).toBe(6);
        expect(suite.get().errorCount).toBe(3);
        expect(suite.get().getErrors('field_1')).toEqual(['second-of-field_1']);
        expect(suite.get().getErrors('field_2')).toEqual(['second-of-field_2']);
        expect(suite.get().getErrors('field_3')).toEqual(['second-of-field_3']);
      });
    });

    describe('When test used to fail and it now passes', () => {
      let run = 0;
      beforeEach(() => {
        suite = create(() => {
          dummyTest.passing('field_1');

          if (run === 0) {
            dummyTest.failing('field_1', 'second-of-field_1');
          } else {
            dummyTest.passing('field_1');
          }
          run++;
        });
      });

      it('Should treat test as passing', () => {
        suite();
        expect(suite.get().hasErrors()).toBe(true);
        expect(suite.get().getErrors('field_1')).toEqual(['second-of-field_1']);
        suite();
        expect(suite.get().hasErrors()).toBe(false);
        expect(suite.get().getErrors('field_1')).toEqual([]);
      });
    });

    describe('When in a nested block', () => {
      it('Should follow the same behavior as if it was not nested', () => {
        const suite = create(() => {
          group('group_1', () => {
            dummyTest.failing('field_1', 'first-of-field_1');
            dummyTest.failing('field_1', 'second-of-field_1');
            dummyTest.failing('field_2', 'first-of-field_2');
            dummyTest.failing('field_2', 'second-of-field_2');
            dummyTest.failing('field_3', 'first-of-field_3');
            dummyTest.failing('field_3', 'second-of-field_3');
          });
        });
        expect(suite.get().testCount).toBe(0); // sanity
        suite();

        expect(suite.get().testCount).toBe(3);
        expect(suite.get().errorCount).toBe(3);
        expect(suite.get().getErrors('field_1')).toEqual(['first-of-field_1']);
        expect(suite.get().getErrors('field_2')).toEqual(['first-of-field_2']);
        expect(suite.get().getErrors('field_3')).toEqual(['first-of-field_3']);
      });
    });
  });

  describe('All', () => {
    beforeEach(() => {
      suite = create(include => {
        mode(Modes.ALL);
        only(include);

        dummyTest.failing('field_1', 'first-of-field_1');
        dummyTest.failing('field_1', 'second-of-field_1'); // Should not run
        dummyTest.failing('field_2', 'first-of-field_2');
        dummyTest.failing('field_2', 'second-of-field_2'); // Should not run
        dummyTest.failing('field_3', 'first-of-field_3');
        dummyTest.failing('field_3', 'second-of-field_3'); // Should not run
      });
    });

    it('Should run all tests', () => {
      expect(suite.get().testCount).toBe(0); // sanity
      suite();
      expect(suite.get().testCount).toBe(6);
      expect(suite.get().errorCount).toBe(6);
    });
  });

  describe('ONE', () => {
    describe('When there are no test failures', () => {
      beforeEach(() => {
        suite = create(() => {
          mode(Modes.ONE);
          dummyTest.passing('field_1', 'first-of-field_1');
          dummyTest.passing('field_1', 'second-of-field_1'); // Should not run
          dummyTest.passing('field_2', 'first-of-field_2');
          dummyTest.passing('field_2', 'second-of-field_2'); // Should not run
          dummyTest.passing('field_3', 'first-of-field_3');
          dummyTest.passing('field_3', 'second-of-field_3'); // Should not run
        });
      });

      it('Should run all tests', () => {
        expect(suite.get().testCount).toBe(0); // sanity
        suite();
        expect(suite.get().testCount).toBe(6);
        expect(suite.get().errorCount).toBe(0);
      });
    });

    describe('When there are test failures', () => {
      beforeEach(() => {
        suite = create(() => {
          mode(Modes.ONE);
          dummyTest.passing('field_1', 'first-of-field_1');
          dummyTest.passing('field_1', 'second-of-field_1');
          dummyTest.failing('field_2', 'first-of-field_2');
          dummyTest.passing('field_2', 'second-of-field_2'); // Should not run
          dummyTest.passing('field_3', 'first-of-field_3'); // should not run
          dummyTest.passing('field_3', 'second-of-field_3'); // Should not run
        });
      });

      it('Should skip all tests after a failed tests', () => {
        expect(suite.get().testCount).toBe(0); // sanity
        suite();
        expect(suite.get().testCount).toBe(3);
        expect(suite.get().errorCount).toBe(1);
        expect(suite.get().tests.field_1).toMatchObject({
          errors: [],
          valid: true,
        });
        expect(suite.get().tests.field_2).toMatchObject({
          errors: ['first-of-field_2'],
          valid: false,
        });
        expect(suite.get().tests.field_3).toMatchObject({
          errors: [],
          valid: false,
        });
      });
    });
  });
});
