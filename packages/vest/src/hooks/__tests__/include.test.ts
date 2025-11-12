import { Modes } from 'Modes';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import * as vest from 'vest';

describe('include', () => {
  let cb1 = vi.fn(),
    cb2 = vi.fn();

  beforeEach(() => {
    cb1 = vi.fn(() => false);
    cb2 = vi.fn(() => false);
  });

  describe('When not passing a string fieldName', () => {
    it('should throw an error', () => {
      // @ts-ignore
      expect(() => vest.include({})).toThrow();
      // @ts-ignore
      expect(() => vest.include(undefined)).toThrow();
    });
  });

  describe('There is an `onlyd` field', () => {
    describe('`include` is run as-is without modifiers', () => {
      it('should run the included test along with the field focused by only()', () => {
        const suite = vest.create(() => {
          vest.only('field_1');
          vest.include('field_2');

          vest.test('field_1', () => false);
          vest.test('field_2', () => false);
        });

        const res = suite.run();
        expect(res.hasErrors('field_1')).toBe(true);
        expect(res.tests.field_1.testCount).toBe(1);
        expect(res.hasErrors('field_2')).toBe(true);
        expect(res.tests.field_2.testCount).toBe(1);
        expect(res).toMatchSnapshot();
      });
    });

    describe('include().when()', () => {
      describe('`when` param is a string', () => {
        describe('`when` param is a name of an only() field', () => {
          it('should run the included field along with the only() field', () => {
            const suite = vest.create(() => {
              vest.only('field_1');
              vest.include('field_2').when('field_1');

              vest.test('field_1', () => false);
              vest.test('field_2', () => false);
              vest.test('field_3', () => false);
            });

            const res = suite.run();
            expect(res.hasErrors('field_1')).toBe(true);
            expect(res.tests.field_1.testCount).toBe(1);
            expect(res.hasErrors('field_2')).toBe(true);
            expect(res.tests.field_2.testCount).toBe(1);
            expect(res.hasErrors('field_3')).toBe(false);
            expect(res.tests.field_3.testCount).toBe(0);
            expect(res).toMatchSnapshot();
          });
        });
        describe('`when` param is a name of a non-included field', () => {
          it('should not run the included field', () => {
            const suite = vest.create(() => {
              vest.only('field_1');
              vest.include('field_2').when('field_3');

              vest.test('field_1', () => false);
              vest.test('field_2', () => false);
              vest.test('field_3', () => false);
            });

            const res = suite.run();
            expect(res.hasErrors('field_1')).toBe(true);
            expect(res.tests.field_1.testCount).toBe(1);
            expect(res.hasErrors('field_2')).toBe(false);
            expect(res.tests.field_2.testCount).toBe(0);
            expect(res.hasErrors('field_3')).toBe(false);
            expect(res.tests.field_3.testCount).toBe(0);
            expect(res).toMatchSnapshot();
          });
        });
        describe('`when` param is a name of a skipped field', () => {
          it('should not run the included field', () => {
            const suite = vest.create(() => {
              vest.only('field_1');
              vest.skip('field_3');
              vest.include('field_2').when('field_3');

              vest.test('field_1', () => false);
              vest.test('field_2', () => false);
              vest.test('field_3', () => false);
            });

            const res = suite.run();
            expect(res.hasErrors('field_1')).toBe(true);
            expect(res.tests.field_1.testCount).toBe(1);
            expect(res.hasErrors('field_2')).toBe(false);
            expect(res.tests.field_2.testCount).toBe(0);
            expect(res.hasErrors('field_3')).toBe(false);
            expect(res.tests.field_3.testCount).toBe(0);
            expect(res).toMatchSnapshot();
          });
        });
      });
      describe('`when` param is a boolean', () => {
        describe('when `true`', () => {
          it('should run the included field', () => {
            const suite = vest.create(() => {
              vest.only('field_1');
              vest.include('field_2').when(true);

              vest.test('field_1', () => false);
              vest.test('field_2', () => false);
              vest.test('field_3', () => false);
            });

            const res = suite.run();
            expect(res.hasErrors('field_1')).toBe(true);
            expect(res.tests.field_1.testCount).toBe(1);
            expect(res.hasErrors('field_2')).toBe(true);
            expect(res.tests.field_2.testCount).toBe(1);
            expect(res.hasErrors('field_3')).toBe(false);
            expect(res.tests.field_3.testCount).toBe(0);
            expect(res).toMatchSnapshot();
          });
        });
        describe('when `false`', () => {
          it('should not run the included field', () => {
            const suite = vest.create(() => {
              vest.only('field_1');
              vest.include('field_2').when(false);

              vest.test('field_1', () => false);
              vest.test('field_2', () => false);
              vest.test('field_3', () => false);
            });

            const res = suite.run();
            expect(res.hasErrors('field_1')).toBe(true);
            expect(res.tests.field_1.testCount).toBe(1);
            expect(res.hasErrors('field_2')).toBe(false);
            expect(res.tests.field_2.testCount).toBe(0);
            expect(res.hasErrors('field_3')).toBe(false);
            expect(res.tests.field_3.testCount).toBe(0);
            expect(res).toMatchSnapshot();
          });
        });
      });
      describe('`when` param is a function', () => {
        describe('when returning `true`', () => {
          it('should run the included field', () => {
            const suite = vest.create(() => {
              vest.only('field_1');
              vest.include('field_2').when(() => true);

              vest.test('field_1', () => false);
              vest.test('field_2', () => false);
              vest.test('field_3', () => false);
            });

            const res = suite.run();
            expect(res.hasErrors('field_1')).toBe(true);
            expect(res.tests.field_1.testCount).toBe(1);
            expect(res.hasErrors('field_2')).toBe(true);
            expect(res.tests.field_2.testCount).toBe(1);
            expect(res.hasErrors('field_3')).toBe(false);
            expect(res.tests.field_3.testCount).toBe(0);
            expect(res).toMatchSnapshot();
          });
        });
        describe('when  returning`false`', () => {
          it('should not run the included field', () => {
            const suite = vest.create(() => {
              vest.only('field_1');
              vest.include('field_2').when(() => false);

              vest.test('field_1', () => false);
              vest.test('field_2', () => false);
              vest.test('field_3', () => false);
            });

            const res = suite.run();
            expect(res.hasErrors('field_1')).toBe(true);
            expect(res.tests.field_1.testCount).toBe(1);
            expect(res.hasErrors('field_2')).toBe(false);
            expect(res.tests.field_2.testCount).toBe(0);
            expect(res.hasErrors('field_3')).toBe(false);
            expect(res.tests.field_3.testCount).toBe(0);
            expect(res).toMatchSnapshot();
          });
        });

        describe('Callback evaluation', () => {
          it('should run the callback for each matching test', () => {
            const cb = vi.fn(() => true);
            const suite = vest.create(() => {
              vest.mode(Modes.ALL);
              vest.only('field_1');
              vest.include('field_2').when(cb);

              vest.test('field_1', () => false);
              expect(cb).toHaveBeenCalledTimes(0);
              vest.test('field_2', () => false);
              expect(cb).toHaveBeenCalledTimes(1);
              vest.test('field_3', () => false);
              expect(cb).toHaveBeenCalledTimes(1);
              vest.test('field_2', () => false);
              expect(cb).toHaveBeenCalledTimes(2);
            });

            suite.run();
            expect(cb).toHaveBeenCalledTimes(2);
          });
          it('should evaluate per test run', () => {
            const cb1 = vi.fn(() => false);
            const cb2 = vi.fn(() => false);
            const cb3 = vi.fn(() => false);
            const cb4 = vi.fn(() => false);

            const suite = vest.create(() => {
              let shouldRun = false;
              vest.mode(Modes.ALL);
              vest.only('x');
              vest.include('field_1').when(() => shouldRun);

              vest.test('field_1', cb1);
              shouldRun = true;
              vest.test('field_1', cb2);
              shouldRun = false;
              vest.test('field_1', cb3);
              shouldRun = true;
              vest.test('field_1', cb4);
            });

            const res = suite.run();
            expect(cb1).toHaveBeenCalledTimes(0);
            expect(cb2).toHaveBeenCalledTimes(1);
            expect(cb3).toHaveBeenCalledTimes(0);
            expect(cb4).toHaveBeenCalledTimes(1);
            expect(res.hasErrors('field_1')).toBe(true);
            expect(res.tests.field_1.testCount).toBe(2);
            expect(res).toMatchSnapshot();
          });
        });
      });
    });
  });

  describe('Field is excluded via `skip`', () => {
    it('should disregard `include` and avoid running the test', () => {
      const suite = vest.create(() => {
        vest.skip('field_1');
        vest.include('field_1');

        vest.test('field_1', () => false);
        vest.test('field_2', () => false);
      });

      const res = suite.run();
      expect(res.hasErrors('field_1')).toBe(false);
      expect(res.tests.field_1.testCount).toBe(0);
      expect(res.hasErrors('field_2')).toBe(true);
      expect(res.tests.field_2.testCount).toBe(1);
      expect(res).toMatchSnapshot();
    });
    it('should disregard `include.when` and avoid running the test', () => {
      const suite = vest.create(() => {
        vest.skip('field_1');
        vest.include('field_1').when(true);

        vest.test('field_1', () => false);
        vest.test('field_2', () => false);
      });

      const res = suite.run();
      expect(res.hasErrors('field_1')).toBe(false);
      expect(res.tests.field_1.testCount).toBe(0);
      expect(res.hasErrors('field_2')).toBe(true);
      expect(res.tests.field_2.testCount).toBe(1);
      expect(res).toMatchSnapshot();
    });
  });

  describe('Field is included via `only`', () => {
    it('should disregard `when` condition and test the field anyway', () => {
      const suite = vest.create(() => {
        vest.only('field_1');
        vest.include('field_1').when(false);

        vest.test('field_1', () => false);
      });

      const res = suite.run();
      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.tests.field_1.testCount).toBe(1);
    });
  });

  describe('Test is excluded via `skip.group`', () => {
    it('should disregard `include` and avoid running the test', () => {
      const suite = vest.create(() => {
        vest.include('field_1');

        vest.group('g1', () => {
          vest.skip(true);
          vest.test('field_1', cb1);
          vest.test('field_2', () => false);
        });
        vest.test('field_1', cb2);
      });

      const res = suite.run();
      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.tests.field_1.testCount).toBe(1);
      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(1);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.tests.field_2.testCount).toBe(0);
      expect(res).toMatchSnapshot();
    });
    it('should disregard `include.when` and avoid running the test', () => {
      const suite = vest.create(() => {
        vest.include('field_1').when(true);

        vest.group('g1', () => {
          vest.skip(true);
          vest.test('field_1', cb1);
          vest.test('field_2', () => false);
        });
        vest.test('field_1', cb2);
      });

      const res = suite.run();
      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.tests.field_1.testCount).toBe(1);
      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(1);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.tests.field_2.testCount).toBe(0);
      expect(res).toMatchSnapshot();
    });
  });
  describe('Test is excluded via `skipWhen`', () => {
    it('Should disregard `include` and avoid running the matching tests', () => {
      const suite = vest.create(() => {
        vest.include('field_1');

        vest.skipWhen(true, () => {
          vest.test('field_1', cb1);
        });
        vest.test('field_1', cb2);
      });

      const res = suite.run();
      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.tests.field_1.testCount).toBe(1);
      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
      expect(res).toMatchSnapshot();
    });
    it('Should disregard `include.when` and avoid running the matching tests', () => {
      const suite = vest.create(() => {
        vest.include('field_1').when(true);

        vest.skipWhen(true, () => {
          vest.test('field_1', cb1);
        });
        vest.test('field_1', cb2);
      });

      const res = suite.run();
      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.tests.field_1.testCount).toBe(1);
      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
      expect(res).toMatchSnapshot();
    });
  });
  describe('When no `skip` or `only`', () => {
    test('include has no effect', () => {
      const suite = vest.create(() => {
        vest.mode(Modes.ALL);
        vest.include('field_1');

        vest.test('field_1', () => false);
        vest.test('field_2', () => false);
      });
      const res = suite.run();

      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.tests.field_1.testCount).toBe(1);
      expect(res.hasErrors('field_2')).toBe(true);
      expect(res.tests.field_2.testCount).toBe(1);
      expect(res).toMatchSnapshot();
    });

    test('include().when has no effect', () => {
      const suite = vest.create(() => {
        vest.mode(Modes.ALL);
        vest.include('field_1').when(false);

        vest.test('field_1', () => false);
        vest.test('field_2', () => false);
      });
      const res = suite.run();

      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.tests.field_1.testCount).toBe(1);
      expect(res.hasErrors('field_2')).toBe(true);
      expect(res.tests.field_2.testCount).toBe(1);
      expect(res).toMatchSnapshot();
    });
  });
});
