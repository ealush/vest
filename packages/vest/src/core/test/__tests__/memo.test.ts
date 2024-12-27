import { describe, it, expect, vi } from 'vitest';
import wait from 'wait';

import { TestPromise } from '../../../testUtils/testPromise';

import { TIsolateTest } from 'IsolateTest';
import { Modes } from 'Modes';
import { VestTest } from 'VestTest';
import promisify from 'promisify';
import * as vest from 'vest';
import { test as vestTest, enforce } from 'vest';

describe('test.memo', () => {
  describe('cache hit', () => {
    it('Should return without calling callback', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn(() => TestPromise(() => undefined));
      const suite = vest.create(() => {
        vestTest.memo('f1', cb1, [1]);
        vestTest.memo('f1', cb2, [2]);
      });

      suite.run();
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
      suite.run();
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });

    it('Should produce correct initial result', () => {
      const res = vest
        .create(() => {
          vest.mode(Modes.ALL);
          vestTest.memo('field1', 'msg1', () => false, [{}]);
          vestTest.memo('field1', 'msg2', () => undefined, [{}]);
          vestTest.memo('field2', () => undefined, [{}]);
          vestTest.memo(
            'field3',
            () => {
              vest.warn();
              return false;
            },
            [{}],
          );
        })
        .run();

      expect(res.hasErrors('field1')).toBe(true);
      expect(res.hasErrors('field2')).toBe(false);
      expect(res.hasWarnings('field3')).toBe(true);
      expect(res).toMatchSnapshot();
    });
    describe('sync', () => {
      it('Should restore previous result on re-run', () => {
        const suite = vest.create(() => {
          vest.mode(Modes.ALL);
          vestTest.memo('field1', 'msg1', () => false, [1]);
          vestTest.memo('field1', 'msg2', () => undefined, [2]);
          vestTest.memo('field2', () => undefined, [3]);
          vestTest.memo(
            'field3',
            () => {
              vest.warn();
              return false;
            },
            [4],
          );
        });

        const res = suite.run();

        expect(res.hasErrors('field1')).toBe(true);
        expect(res.hasErrors('field2')).toBe(false);
        expect(res.hasWarnings('field3')).toBe(true);
        expect(res).toMatchSnapshot();

        const res2 = suite.run();
        expect(res2.hasErrors('field1')).toBe(true);
        expect(res2.hasErrors('field2')).toBe(false);
        expect(res2.hasWarnings('field3')).toBe(true);
        expect(res).isDeepCopyOf(res2);
      });
    });

    describe('async', () => {
      it('Should immediately return previous result on re-run', async () => {
        {
          const suite = vest.create(() => {
            vestTest.memo(
              'field1',
              async () => {
                await wait(500);
                enforce(1).equals(2);
              },
              [1],
            );
            vestTest.memo(
              'field2',
              async () => {
                await wait(500);
                enforce(1).equals(2);
              },
              [2],
            );
          });

          const asyncSuite = promisify(suite.run);

          let start = Date.now();
          const res1 = await asyncSuite();
          enforce(Date.now() - start).gte(500);

          start = Date.now();
          const res2 = suite.run();

          expect(res1).isDeepCopyOf(res2);
        }
      });
    });

    describe('Test is canceled', () => {
      it('Should refresh', async () => {
        let count = 0;
        const tests: TIsolateTest[] = [];
        const suite = vest.create(() => {
          count++;

          tests.push(
            vestTest.memo(
              'f1',
              async () => {
                await wait(10);
              },
              [true],
            ),
          );

          if (count === 1) {
            VestTest.cancel(tests[0]);
          }
        });

        suite.run();
        suite.run();
        suite.run();

        expect(tests[0]).not.toBe(tests[1]);
        expect(tests[1]).toBe(tests[2]);
      });
    });
  });

  describe('cache miss', () => {
    it('Should run test normally', () => {
      const cb1 = vi.fn(res => res);
      const cb2 = vi.fn(
        res => new Promise<void>((resolve, rej) => (res ? resolve() : rej())),
      );
      const suite = vest.create((key, res) => {
        vestTest.memo('f1', () => cb1(res), [1, key]);
        vestTest.memo('f2', () => cb2(res), [2, key]);
      });

      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(0);
      suite.run('a', false);
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
      expect(suite.get().hasErrors()).toBe(true);
      suite.run('b', true);
      expect(cb1).toHaveBeenCalledTimes(2);
      expect(cb2).toHaveBeenCalledTimes(2);
      expect(suite.get().hasErrors()).toBe(false);
    });
  });

  describe('Collision detection', () => {
    describe('cross-field collision', () => {
      it('Should factor in field name', () => {
        const suite = vest.create(() => {
          vestTest.memo('f1', () => false, [1]);
          vestTest.memo('f2', () => true, [1]);
        });

        suite.run();
        suite.run();
        expect(suite.get().hasErrors('f1')).toBe(true);
        expect(suite.get().hasErrors('f2')).toBe(false);
      });
    });

    describe('same-field-same-suite collision', () => {
      it('Should factor in execution order', () => {
        const suite = vest.create(() => {
          vestTest.memo('f1', () => false, [1]);
          vestTest.memo('f1', () => true, [1]);
        });

        suite.run();
        suite.run();
        expect(suite.get().hasErrors('f1')).toBe(true);
        expect(suite.get().errorCount).toBe(1);
      });
    });
    describe('cross-suite collision', () => {
      it('Should factor in field name', () => {
        const suite1 = vest.create(() => {
          vestTest.memo('f1', () => false, [1]);
          vestTest.memo('f2', () => true, [1]);
        });
        const suite2 = vest.create(() => {
          vestTest.memo('f1', () => true, [1]);
          vestTest.memo('f2', () => false, [1]);
        });

        suite1.run();
        suite2.run();
        expect(suite1.get().hasErrors('f1')).toBe(true);
        expect(suite1.get().hasErrors('f2')).toBe(false);
        expect(suite2.get().hasErrors('f1')).toBe(false);
        expect(suite2.get().hasErrors('f2')).toBe(true);
      });
    });
  });
});
