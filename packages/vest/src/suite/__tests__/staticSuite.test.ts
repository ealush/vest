import { describe, it, expect } from 'vitest';
import wait from 'wait';

import { SuiteSerializer } from 'SuiteSerializer';
import { VestIsolateType } from 'VestIsolateType';
import * as vest from 'vest';

describe('runStatic', () => {
  it('Should run a static suite', () => {
    const suite = vest.create(() => {
      vest.test('t1', () => false);
      vest.test('t2', () => false);
    });

    const res = suite.runStatic();
    expect(suite.runStatic()).not.toBe(suite.runStatic());

    expect(res.hasErrors('t1')).toBe(true);
    expect(res.hasErrors('t2')).toBe(true);
  });

  it('Should serialize and resume a static suite', () => {
    const suite = vest.create(() => {
      vest.test('t1', () => false);
      vest.test('t2', () => false);
    });

    const serialized = SuiteSerializer.serialize(suite.runStatic());
    const suite2 = vest.create(() => {
      vest.test('t3', () => false);
      vest.test('t4', () => false);
    });

    SuiteSerializer.resume(suite2, serialized);

    expect(suite2.hasErrors('t1')).toBe(true);
    expect(suite2.hasErrors('t2')).toBe(true);
    expect(suite2.hasErrors('t3')).toBe(false);
    expect(suite2.hasErrors('t4')).toBe(false);
  });

  describe('runStatic (promise)', () => {
    it("Should resolve with the suite's result", async () => {
      const suite = vest.create(() => {
        vest.test('t1', async () => {
          await wait(100);
          throw new Error();
        });
      });

      const res = suite.runStatic();
      expect(res.errorCount).toBe(0);
      const result = await res;
      expect(result.errorCount).toBe(1);
    });

    it("Should have a dump method on the resolved suite's result", async () => {
      const suite = vest.create(() => {
        vest.test('t1', async () => {
          await wait(100);
          throw new Error();
        });
      });

      const res = suite.runStatic();
      const result = await res;
      expect(result).toHaveProperty('dump');
      expect(result.dump()).toHaveProperty('$type', VestIsolateType.Suite);
    });
  });
  describe('When creating the suite with a name', () => {
    it("Should set the suite's name", () => {
      const suite = vest.create('user_form', () => {
        vest.test('t1', () => false);
      });

      const res = suite.runStatic();

      expect(res.suiteName).toBe('user_form');
    });
  });
});
